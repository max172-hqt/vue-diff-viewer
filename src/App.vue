<script setup lang="ts">
import { ref, watch } from "vue";
import { VueDiffViewer } from "../lib/main";

const prev = ref(`var a1 = {
  "name": "vue-diff",
  "version": "0.0.0",
  "description": "Vue diff viewer",
  "private": true,
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}
`);
const curr = ref(`const b2 = {
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
}
`);
</script>

<template>
  <div>
    <div class="textarea">
      <div class="prev">
        <textarea name="prev" id="prev" rows="20" v-model="prev"></textarea>
      </div>
      <div class="curr">
        <textarea name="curr" id="curr" rows="20" v-model="curr"></textarea>
      </div>
    </div>
    <VueDiffViewer :prev="prev" :curr="curr" />
  </div>
</template>

<style scoped>
.textarea {
  display: flex;
  width: 100%;
}

.prev,
.curr {
  flex: 1;
}

textarea {
  width: 100%;
}
</style>
