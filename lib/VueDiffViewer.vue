<script setup lang="ts">
import { computed } from "vue";
import { diffChars, diffLines } from "diff";
import { groupBy } from "lodash";

const OPENING_TAG = "<code-modifed>";
const CLOSING_TAG = "</code-modifed>";

const props = defineProps({
  prev: {
    type: String,
    required: true,
  },
  curr: {
    type: String,
    required: true,
  },
});

const changes = computed(() => {
  return diffLines(props.prev, props.curr);
});

const lines = computed(() => {
  const results = [];
  let lineNumber = 1;
  let previousLineLabel = 1;
  let currentLineLabel = 1;

  for (const change of changes.value) {
    const parts = change.value.replace(/\n$/, "").split("\n");
    const endWithNewLine = /\n$/.test(change.value);

    let type = "";
    if (change.added) type = "added";
    else if (change.removed) type = "removed";
    else type = "common";

    for (const part of parts) {
      if (type === "common") {
        results.push(
          {
            lineNumber,
            value: part,
            type: "common_prev",
            lineLabel: previousLineLabel,
          },
          {
            lineNumber,
            value: part,
            type: "common_curr",
            lineLabel: currentLineLabel,
          }
        );
        if (parts.length > 1) {
          previousLineLabel++;
          currentLineLabel++;
          lineNumber++;
        }
      } else {
        results.push({
          lineNumber: lineNumber,
          lineLabel: type === "removed" ? previousLineLabel : currentLineLabel,
          value: part,
          type,
        });
        if (parts.length > 1) {
          lineNumber++;
          if (type === "removed") {
            previousLineLabel++;
          } else {
            currentLineLabel++;
          }
        }
      }
    }

    if (endWithNewLine && parts.length === 1) {
      if (type === "removed") {
        previousLineLabel++;
      } else if (type === "added") {
        currentLineLabel++;
      } else {
        previousLineLabel++;
        currentLineLabel++;
      }

      if (type !== "removed") {
        lineNumber++;
      }
    }
  }

  const grouped = groupBy(results, "lineNumber");

  return grouped;
});
</script>

<template>
  <div class="wrapper">
    <div class="prev">
      <template v-for="lineNumber in Object.keys(lines)">
        <div class="line">
          <div class="line-number">
            {{
              lines[lineNumber].length > 1 ? lines[lineNumber][0].lineLabel : ""
            }}
          </div>
          <div>
            <template v-for="part in lines[lineNumber]">
              <span v-if="part.type === 'common_prev'">{{ part.value }}</span>
              <span v-else-if="part.type === 'removed'" class="removed">{{
                part.value
              }}</span>
              <span v-else><br /></span>
            </template>
          </div>
        </div>
      </template>
    </div>
    <div class="curr">
      <template v-for="lineNumber in Object.keys(lines)">
        <div class="line">
          <div class="line-number">{{ lineNumber }}</div>
          <div>
            <template v-for="part in lines[lineNumber]">
              <span v-if="part.type === 'common_curr'">{{ part.value }}</span>
              <span v-else-if="part.type === 'added'" class="added">{{
                part.value
              }}</span>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  font-family: "ui-monospace", "Courier New", Courier, monospace;
  width: 100%;
  background: #f1f1f1;
  display: flex;
  white-space: pre-wrap;

  .prev,
  .curr {
    flex: 1 0 0;
  }

  .line {
    display: flex;
    gap: 1rem;
  }

  .added {
    display: inline-block;
    background-color: green;
  }

  .removed {
    display: inline-block;
    background-color: red;
  }
}
</style>
