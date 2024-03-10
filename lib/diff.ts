import { Change, diffLines } from "diff";
import { groupBy } from "lodash";
import { computed, ref, toValue, watchEffect } from "vue";
import type { Ref } from "vue";

export enum ChangeType {
  COMMON = "common",
  REMOVED = "removed",
  ADDED = "added",
}

export interface Line {
  value: string;
  type: ChangeType;
}

export interface Diff {
  value?: string;
  lineNumber?: number;
  type?: ChangeType;
}

export interface DisplayedLineDiff {
  prev: Diff;
  curr: Diff;
}

/**
 * Get lines
 *
 * @param changes Changes defined by diff library
 */
function getLines(changes: Change[]): Line[] {
  const results: Line[] = [];

  for (const change of changes) {
    const lines = change.value.split("\n");

    // Remove empty lines due to split function when '\n' is at the beginning or the end
    if (lines[0] === "") {
      lines.shift();
    }
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    for (const line of lines) {
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
    const lines = getLines(changes.value);

    const results: DisplayedLineDiff[] = [];
    const skippedLines = [];

    let previousLineNumber = 0;
    let currentLineNumber = 0;
    let index = 0;

    for (const line of lines) {
      const prev: Diff = {};
      const curr: Diff = {};

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

        curr.lineNumber = currentLineNumber;
        curr.value = line.value;
        curr.type = ChangeType.ADDED;
      } else {
        previousLineNumber++;

        prev.lineNumber = previousLineNumber;
        prev.value = line.value;
        prev.type = ChangeType.REMOVED;

        // Handle modification
        if (lines[index + 1].type === ChangeType.ADDED) {

        }
      }

      results.push({ prev, curr });
      index++;
    }

    return results;
  });

  watchEffect(() => {
    getDiffLines();
  });

  return { displayedLines };
}
