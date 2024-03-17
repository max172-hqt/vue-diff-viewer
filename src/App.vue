<script setup lang="ts">
import { VueDiffViewer } from "../lib/main";

const prev = `  // Use diffLines for strings, and diffJson for objects...
  if (typeof oldString === 'string' && typeof newString === 'string') {
    diffArray = diff.diffLines(
      oldString.trimRight(),
      newString.trimRight(),
      {
        newlineIsToken: false,
        ignoreWhitespace: false,
`;
const curr = `  // Use diffLines for strings, and diffJson for objects...
  if (typeof oldString === 'string' && typeof newString === 'string') {
    diffArray = diff.diffLines(
      oldString
      newString
      {
        newlineIsToken: false,
        ignoreWhitespace: false,
`;
</script>

<template>
  <VueDiffViewer :prev="prev" :curr="curr" />
</template>
