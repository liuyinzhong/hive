<script lang="ts" setup>
import { computed } from 'vue';
import { Tag } from 'antdv-next';
import { getLocalDictRow } from '#/dicts';

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
  <Tag :color="dictRow.color">{{ dictRow.label || '-' }}</Tag>
</template>
