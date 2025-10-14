<template>
  <a-select v-model:value="selectedValue" @change="handleChange" class="w-full">
    <a-select-option
      v-for="option in colorOptions"
      :key="option.value"
      :value="option.value"
    >
      <a-tag :color="option.value">{{ option.label }} {{ option.value }}</a-tag>
    </a-select-option>
  </a-select>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

// 组件属性定义
interface Props {
  /** 当前选中的颜色值 */
  value: string;
}

// 组件事件定义
interface Emits {
  (e: 'update:value', value: string): void;
  (e: 'change', value: string): void;
}

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  value: '',
});

// 使用ref来管理选中的值，便于后续扩展
const selectedValue = ref(props.value);

// 监听外部value变化，同步内部状态
watch(
  () => props.value,
  (newVal) => {
    selectedValue.value = newVal;
  },
);

// 完整的颜色选项配置
const colorOptions = [
  { value: 'processing', label: '主题色' },
  { value: 'default', label: '默认' },
  { value: 'success', label: '成功' },
  { value: 'error', label: '错误' },
  { value: 'warning', label: '警告' },
  { value: 'magenta', label: '品红' },
  { value: 'red', label: '红色' },
  { value: 'volcano', label: '火山橙' },
  { value: 'orange', label: '橙色' },
  { value: 'gold', label: '金色' },
  { value: 'lime', label: '酸橙绿' },
  { value: 'green', label: '绿色' },
  { value: 'cyan', label: '青色' },
  { value: 'blue', label: '蓝色' },
  { value: 'geekblue', label: '极客蓝' },
  { value: 'purple', label: '紫色' },
];
/**
 * 处理颜色选择变化
 * @param value 选中的颜色值
 */
const handleChange = (value: string) => {
  selectedValue.value = value;
  emit('update:value', value);
  emit('change', value);
};
</script>

<style scoped></style>
