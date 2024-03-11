<script setup lang="ts">
import { ref } from "vue";
import { VueDiffViewer } from "../lib/main";

const curr = ref(`var a1 = {
  "name": "vue-diff",
  "version": "0.0.0",
  "description": "Vue diff viewer",
  "private": true,
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}`);
const prev = ref(`const b2 = {
  "name": "vue-diff",
  "version": "1.0.0",
  "description": "Vue diff viewer",
  "scripts": {
    "test": "vue-cli-service test:unit"
    "lint": "vue-cli-service lint"
  },
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}`);
</script>

<template>
  <VueDiffViewer :prev="prev" :curr="curr" />
</template>
