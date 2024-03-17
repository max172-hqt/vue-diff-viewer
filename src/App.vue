<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDiffViewer } from "../lib/main";

const prev = ref('')
const curr = ref('')
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

.prev, .curr {
  flex: 1
}

textarea {
  width: 100%;
}
</style>