<script setup lang="ts">
import { useDiff, ChangeType } from "./diff";

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

const { displayedLines: lines } = useDiff(
  props.prev,
  props.curr
);

console.log(lines.value);
</script>

<template>
  <div class="wrapper">
    <div class="prev">
      <template v-for="line in lines">
        <div class="line">
          <div class="line-number">
            {{ line.prev?.lineNumber }}
          </div>
          <pre
            :class="{
              removed: line.prev?.type === ChangeType.REMOVED,
            }"
            >{{ line.prev?.value }}</pre
          >
        </div>
      </template>
    </div>
    <div class="curr">
      <template v-for="line in lines">
        <div class="line" v-if="Object.keys(line.curr).length > 0">
          <div class="line-number">
            {{ line.curr?.lineNumber }}
          </div>
          <pre
            :class="{
              added: line.curr?.type === ChangeType.ADDED,
            }"
            >
            {{ line.curr?.value }}</pre
          >
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  background: #f1f1f1;
  display: flex;
  padding: 0.5em 1em;

  pre {
    margin: 0;
  }

  .prev,
  .curr {
    flex: 1 0 0;
  }

  .line {
    display: flex;
    align-items: center;
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
