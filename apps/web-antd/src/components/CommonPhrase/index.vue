<script lang="ts" setup>
import { EllipsisText } from '@vben/common-ui';
import { computed } from 'vue';
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
      <EllipsisText tooltipWhenEllipsis> {{ item }} </EllipsisText>
    </div>
  </div>
</template>
