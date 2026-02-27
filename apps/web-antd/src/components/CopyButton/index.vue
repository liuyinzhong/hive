<script lang="ts" setup>
import { useClipboard } from '@vueuse/core';

/**
 * 复制按钮组件
 * 功能：提供复制文本到剪贴板的功能
 */

// 组件属性定义
interface Props {
  /**
   * 要复制的文本内容
   */
  text: string;
  /**
   * 是否显示图标
   * @default true
   */
  showIcon?: boolean;
  /**
   * 是否显示文本
   * @default true
   */
  showText?: boolean;
}

// 定义组件属性，默认值
const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  showText: true,
});

// 定义组件事件
const emit = defineEmits<{
  /**
   * 复制成功时触发的事件
   */
  (e: 'copy-success'): void;
  /**
   * 复制失败时触发的事件
   */
  (e: 'copy-error'): void;
}>();

// 使用剪贴板钩子
const { copy, copied } = useClipboard();

/**
 * 执行复制操作
 */
const handleCopy = async () => {
  try {
    await copy(props.text);
    emit('copy-success');
  } catch (error) {
    emit('copy-error');
  }
};

// 暴露组件实例属性
defineExpose({
  copy: handleCopy,
  copied,
});
</script>

<template>
  <a-button v-bind="$attrs" @click="handleCopy">
    <span v-if="showIcon" class="icon-[lucide--copy]"></span>
    <span v-if="showText">复制</span>
  </a-button>
</template>
