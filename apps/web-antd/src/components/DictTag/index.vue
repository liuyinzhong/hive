<script lang="ts" setup>
import { getLocalDictRow } from '#/dicts';
import { computed } from 'vue';

const props = defineProps({
  dictType: {
    type: String,
    required: true,
  },
  value: {
    required: true,
  },
});

const dictRow = computed(() => getLocalDictRow(props.dictType, props.value));
</script>
<template>
  <a-tag :color="dictRow.color">{{ dictRow.label || '-' }}</a-tag>
</template>
