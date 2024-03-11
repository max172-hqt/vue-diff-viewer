import { Change, diffLines, diffWords } from "diff";
import { computed, ref, toValue, watchEffect } from "vue";
import type { Ref } from "vue";

export enum ChangeType {
  COMMON = "common",
  REMOVED = "removed",
  ADDED = "added",
}

export interface DiffComponent {
  value: string;
  type: ChangeType;
}

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
function getDiffComponents(changes: Change[]): DiffComponent[] {
  const results: DiffComponent[] = [];

  for (const change of changes) {
    const components = change.value.split("\n");

    // Remove empty components due to split function when '\n' is at the beginning or the end
    if (components[0] === "") {
      components.shift();
    }
    if (components[components.length - 1] === "") {
      components.pop();
    }

    for (const line of components) {
      if (change.added) {
        results.push({
          value: line,
          type: ChangeType.ADDED,
        });
      } else if (change.removed) {
        results.push({
          value: line,
          type: ChangeType.REMOVED,
        });
      } else {
        results.push({
          value: line,
          type: ChangeType.COMMON,
        });
      }
    }
  }

  return results;
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
    const components = getDiffComponents(changes.value);

    let previousLineNumber = 0;
    let currentLineNumber = 0;

    /**
     * Helper function
     * @param line Current line
     */
    function getDisplayedDiff(
      components: DiffComponent[],
      { diffingWord = true }
    ): DisplayedDiff[] {
      const skippedLines: Number[] = [];
      const results: DisplayedDiff[] = [];
      let index = 0;

      for (const line of components) {
        let prev: Diff = {};
        let curr: Diff = {};
        if (skippedLines.includes(index)) {
          index++;
          continue;
        }

        if (line.type === ChangeType.COMMON) {
          previousLineNumber++;
          currentLineNumber++;

          prev.lineNumber = previousLineNumber;
          prev.value = line.value;
          prev.type = ChangeType.COMMON;
          curr.lineNumber = currentLineNumber;
          curr.value = line.value;
          curr.type = ChangeType.COMMON;
        } else if (line.type === ChangeType.ADDED) {
          currentLineNumber++;

          if (currentLineNumber < results.length) {
            results[currentLineNumber - 1].curr.lineNumber = currentLineNumber;
            results[currentLineNumber - 1].curr.value = line.value;
            results[currentLineNumber - 1].curr.type = line.type;
          } else {
            curr.lineNumber = currentLineNumber;
            curr.value = line.value;
            curr.type = ChangeType.ADDED;
          }
        } else {
          previousLineNumber++;

          prev.lineNumber = previousLineNumber;
          prev.value = line.value;
          prev.type = ChangeType.REMOVED;

          // Handle line modification
          const nextLine = components[index + 1];
          if (nextLine && nextLine.type === ChangeType.ADDED) {
            skippedLines.push(index + 1);
            currentLineNumber++;

            if (diffingWord) {
              const tmpLineNumber = currentLineNumber;

              const wordChanges = diffWords(line.value, nextLine.value);
              const diffComponents = getDiffComponents(wordChanges);
              const displayedDiffs = getDisplayedDiff(diffComponents, {
                diffingWord: false,
              });

              prev.value = [];
              curr.value = [];

              curr.lineNumber = tmpLineNumber;
              curr.type = nextLine.type

              for (const diff of displayedDiffs) {
                diff.curr.lineNumber = tmpLineNumber;
                diff.prev.lineNumber = tmpLineNumber;
                prev.value.push(diff.prev);
                curr.value.push(diff.curr);
              }

              // Reset line number
              currentLineNumber = tmpLineNumber;
              previousLineNumber = tmpLineNumber;
            } else {
              if (currentLineNumber < results.length) {
                results[currentLineNumber - 1].curr.lineNumber =
                  currentLineNumber;
                results[currentLineNumber - 1].curr.value = nextLine.value;
                results[currentLineNumber - 1].curr.type = nextLine.type;
              } else {
                curr.lineNumber = currentLineNumber;
                curr.value = nextLine.value;
                curr.type = nextLine.type;
              }
            }
          }
        }
        index++;
        results.push({ prev, curr });
      }
      return results;
    }

    const displayedLines = getDisplayedDiff(components, { diffingWord: true });
    return displayedLines;
  });

  watchEffect(() => {
    getDiffLines();
  });

  return { displayedLines };
}
