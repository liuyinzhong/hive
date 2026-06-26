<script lang="ts" setup>
import { computed } from 'vue';

import { EllipsisText } from '@vben/common-ui';
const props = defineProps({
  textList: {
    required: true,
  },
});
const emit = defineEmits<{
  dblClick: [text: string];
}>();

const dbClickHandle = (text: string): void => {
  emit('dblClick', text);
};

const textDataList = computed(() => props.textList);
</script>
<template>
  <div>
    <div
      class="mb-2"
      v-for="item in textDataList"
      :key="item"
      @dblclick="dbClickHandle(item)"
    >
      <EllipsisText tooltip-when-ellipsis> {{ item }} </EllipsisText>
    </div>
  </div>
</template>
