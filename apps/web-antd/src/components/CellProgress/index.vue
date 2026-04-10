<script setup lang="ts">
import { computed } from 'vue';

import { Progress } from 'ant-design-vue';

/**
 * vxe-table 自定义进度条单元格组件
 * 根据当前值和总值计算进度百分比，并显示不同颜色的进度条
 */

// 定义组件属性
const props = defineProps({
  // 当前进度百分比值
  value: {
    type: Number,
    required: false,
    default: 0,
  },
});

// 计算进度百分比（确保数值有效）
const percent = computed(() => {
  const val = Number(props.value);
  return Number.isNaN(val) ? 0 : val;
});

// 根据百分比计算进度条状态（颜色）
const status = computed(() => {
  return percent.value > 100 ? 'exception' : 'success';
});

/**
 * 进度条文本格式化函数
 * @param _e - 原始百分比值（未使用）
 * @returns 格式化后的文本
 */
const formatProgress: any = (_e: number) => {
  return `${percent.value}%`;
};
</script>

<template>
  <Progress
    :percent="percent"
    :status="status"
    :show-info="true"
    :format="formatProgress"
    :style="{
      width: '100%',
      paddingRight: '30px',
      margin: 0,
    }"
  />
</template>

<style scoped></style>
