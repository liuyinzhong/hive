<script setup lang="ts">
import type { Edge, Node } from '@vue-flow/core';

import { ref } from 'vue';

import { VueFlow } from '@vue-flow/core';

import { getLocalDictList } from '#/dicts';

const dictList = getLocalDictList('STORY_STATUS');

const nodes = ref<Node[]>(
  dictList.map((item, index) => ({
    id: item.value,
    type: index === 0 ? 'input' : '',
    position: { x: 150, y: index * 60 },
    data: { label: item.label },
  })),
);

const edges = ref<any[]>(
  dictList.map((item, index) => ({
    id: `e${item.value}->${dictList[index + 1]?.value}`,
    source: item.value,
    target: dictList[index + 1]?.value,
    animated: true,
  })),
);
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges" />
</template>

<style></style>
