<script setup lang="ts">
import { toRefs } from "vue";
import { ChangeType, useDiff } from "./diff";

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

const { prev, curr } = toRefs(props)

const { displayedLines: lines } = useDiff(prev, curr);
</script>

<template>
  <table class="diff-table">
    <thead v-if="false"></thead>
    <tbody>
      <tr v-for="line in lines">
        <td
          class="num"
          :data-line-number="line.prev.lineNumber"
          :class="{
            'num-removed': line.prev.type === ChangeType.REMOVED,
            empty: line.prev.type === undefined,
          }"
        ></td>
        <td
          class="code"
          :class="{
            'line-removed': line.prev.type === ChangeType.REMOVED,
            empty: line.prev.type === undefined,
          }"
        >
          <template v-if="Array.isArray(line.prev.value)">
            <span
              v-for="word in line.prev.value"
              class="code-inner"
              :class="{
                'word-removed': word.type === ChangeType.REMOVED,
              }"
              >{{ word.value }}</span
            >
          </template>
          <span v-else class="code-inner">{{ line.prev.value }}</span>
        </td>
        <td
          class="num"
          :data-line-number="line.curr.lineNumber"
          :class="{
            'num-added': line.curr.type === ChangeType.ADDED,
            empty: line.curr.type === undefined,
          }"
        ></td>
        <td
          class="code"
          :class="{
            'line-added': line.curr.type === ChangeType.ADDED,
            empty: line.curr.type === undefined,
          }"
        >
          <template v-if="Array.isArray(line.curr.value)">
            <span
              v-for="word in line.curr.value"
              class="code-inner"
              :class="{
                'word-added': word.type === ChangeType.ADDED,
              }"
              >{{ word.value }}</span
            >
          </template>
          <span v-else class="code-inner">{{ line.curr.value }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped lang="scss">
.diff-table {
  width: 100%;
  table-layout: fixed;
  border-spacing: 0;
  border: none;
  border-collapse: collapse;
}

.diff-table td:nth-child(2) {
  border-right: 1px solid lightgray;
}

.num {
  width: 1%;
  min-width: 50px;
  font-size: 12px;
  padding-left: 10px;
  padding-right: 10px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;

  &:before {
    content: attr(data-line-number);
  }
}

.code {
  white-space: pre-wrap;
  padding-left: 12px;
}

.code-inner {
  display: table-cell;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;
}

.num-removed {
  background-color: rgba(248, 81, 73, 0.1);
}

.line-removed {
  background-color: rgba(248, 81, 73, 0.1);
  position: relative;
  &:before {
    content: "-";
    position: absolute;
    left: -3px;
    top: -2px;
  }
}

.word-removed {
  background-color: rgba(248, 81, 73, 0.4);
}

.num-added {
  background-color: rgba(46, 160, 67, 0.15);
}

.empty {
  background-color: #8080801a;
}

.line-added {
  background-color: rgba(46, 160, 67, 0.15);
  position: relative;
  &:before {
    content: "+";
    position: absolute;
    left: -3px;
    top: -2px;
  }
}

.word-added {
  background-color: rgba(46, 160, 67, 0.4);
}
</style>
