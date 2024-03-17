import { Change, diffLines, diffWordsWithSpace } from "diff";
import { Ref, computed, ref, toValue, watchEffect } from "vue";

export enum ChangeType {
  COMMON = "common",
  REMOVED = "removed",
  ADDED = "added",
}

type DiffComponent<TChangeType = ChangeType> =
  TChangeType extends ChangeType.COMMON
    ? {
        value: string;
        type: TChangeType;
        lineNumber: [number, number];
      }
    : {
        value: string;
        type: TChangeType;
        lineNumber: number;
      };

export interface Diff {
  value?: string | Diff[];
  lineNumber?: number;
  type?: ChangeType;
}

export interface DisplayedDiff {
  prev: Diff;
  curr: Diff;
}

/**
 * Do some cleanup and process of the results returned from diff library
 *
 * @param changes Changes defined by diff library
 */
function getDiffComponents(changes: Change[]): {
  components: DiffComponent[];
  maxLine: number;
} {
  let previousLineNumber = 0;
  let currentLineNumber = 0;
  let numLines = 0;

  const results: DiffComponent[] = [];

  let index = 0;

  for (const change of changes) {
    const components = change.value.split("\n");

    // Remove empty components due to split function when '\n' is at the beginning or the end
    // if (components[0] === "") {
    //   components.shift();
    // }

    if (components[components.length - 1] === "") {
      components.pop();
    }

    // Do not count line if it's for modifying
    if (index > 0 && change.added && changes[index - 1].removed) {
      numLines -= 1;
    }

    for (const line of components) {
      if (change.added) {
        currentLineNumber++;
        results.push({
          value: line,
          type: ChangeType.ADDED,
          lineNumber: currentLineNumber,
        });
      } else if (change.removed) {
        previousLineNumber++;
        results.push({
          value: line,
          type: ChangeType.REMOVED,
          lineNumber: previousLineNumber,
        });
      } else {
        currentLineNumber++;
        previousLineNumber++;
        results.push({
          value: line,
          type: ChangeType.COMMON,
          lineNumber: [previousLineNumber, currentLineNumber],
        });
      }
      numLines++;
    }
    index++;
  }

  return {
    components: results,
    maxLine: numLines + 1,
  };
}

function getDisplayedDiffLines({
  components,
  maxLine,
}: {
  components: DiffComponent[];
  maxLine: number;
}): DisplayedDiff[] {
  const results: DisplayedDiff[] = Array(maxLine)
    .fill(null)
    .map(() => ({ prev: {}, curr: {} }));

  let index = 0;
  let removedIndex = -1;
  const ignoredLines: number[] = [];
  let previousInsertPosition = 0;
  let currentInsertPosition = 0;

  for (const component of components) {
    if (
      component.type !== ChangeType.COMMON &&
      ignoredLines.includes(component.lineNumber)
    ) {
      index++;
      continue;
    }

    if (component.type === ChangeType.COMMON) {
      previousInsertPosition++;
      currentInsertPosition++;
      const [previousLine, currentLine] = component.lineNumber;
      previousInsertPosition = Math.max(previousInsertPosition, currentInsertPosition);
      currentInsertPosition = Math.max(previousInsertPosition, currentInsertPosition);
      results[previousInsertPosition].prev = {
        ...component,
        lineNumber: previousLine,
      };
      results[currentInsertPosition].curr = {
        ...component,
        lineNumber: currentLine,
      };
      removedIndex = -1;
    } else if (component.type === ChangeType.REMOVED) {
      previousInsertPosition++;
      if (removedIndex === -1) {
        // Keep track of the first removed line to compare to an added line later
        removedIndex = previousInsertPosition;
      }

      results[previousInsertPosition].prev = { ...component };

      if (index < components.length - 1) {
        const nextLine = components[index + 1];

        // Line is modified
        if (nextLine.type === ChangeType.ADDED) {
          ignoredLines.push(nextLine.lineNumber);
          results[removedIndex].curr = { ...nextLine };
          currentInsertPosition = removedIndex;
          removedIndex = -1;
        } else {
          currentInsertPosition = Math.max(
            previousInsertPosition,
            currentInsertPosition
          );
        }
      } else {
        currentInsertPosition = Math.max(
          previousInsertPosition,
          currentInsertPosition
        );
      }
    } else {
      currentInsertPosition++;
      results[currentInsertPosition].curr = { ...component };
      removedIndex = -1;
      previousInsertPosition = Math.max(
        previousInsertPosition,
        currentInsertPosition
      );
    }
    index++;
  }

  return results;
}

function getDisplayedDiffLinesAndWords(
  lines: DisplayedDiff[]
): DisplayedDiff[] {
  const linesCopy = structuredClone(lines);

  for (const diff of linesCopy) {
    const prev = diff.prev;
    const curr = diff.curr;
    if (prev.type === ChangeType.REMOVED && curr.type === ChangeType.ADDED) {
      const previousLine = diff.prev.lineNumber;
      const currentLine = diff.curr.lineNumber;
      const wordChanges = diffWordsWithSpace(
        diff.prev.value as string,
        diff.curr.value as string
      );
      const { components } = getDiffComponents(wordChanges);

      diff.prev.value = [];
      diff.curr.value = [];
      for (const component of components) {
        if (component.type === ChangeType.COMMON) {
          diff.prev.value.push({ ...component, lineNumber: previousLine });
          diff.curr.value.push({ ...component, lineNumber: currentLine });
        } else if (component.type === ChangeType.ADDED) {
          diff.curr.value.push({ ...component, lineNumber: currentLine });
        } else {
          diff.prev.value.push({ ...component, lineNumber: previousLine });
        }
      }
    }
  }

  linesCopy.shift();
  return linesCopy;
}

export function useDiff(
  oldStr: Ref<string> | string,
  newStr: Ref<string> | string
) {
  const changes = ref<Change[]>([]);

  const getDiffLines = () => {
    changes.value = diffLines(toValue(oldStr), toValue(newStr));
  };

  const displayedLines = computed(() => {
    const { components, maxLine } = getDiffComponents(changes.value);
    const lines = getDisplayedDiffLines({ components, maxLine });
    const linesAndWords = getDisplayedDiffLinesAndWords(lines);
    return linesAndWords;
  });

  watchEffect(() => {
    getDiffLines();
  });

  return { displayedLines };
}
