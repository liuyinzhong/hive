<script lang="ts" setup>
import { h, ref, watch } from 'vue';
import { Select, Tag } from 'antdv-next';

// 组件属性定义
interface Props {
  /** 当前选中的颜色值 */
  value?: string;
}

// 组件事件定义
interface Emits {
  (e: 'update:value', value: string): void;
  (e: 'change', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
});

const emit = defineEmits<Emits>();

// 使用ref来管理选中的值，便于后续扩展
const selectedValue = ref(props.value);

// 监听外部value变化，同步内部状态
watch(
  () => props.value,
  (newVal) => {
    selectedValue.value = newVal;
  },
);

// 基础颜色选项配置
const baseColorOptions = [
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

// antdv-next 的 Select 不支持 SelectOption 子组件写法，需通过 options 传入；
// label 类型为 VueNode，用 Tag 渲染颜色示例
const colorOptions = baseColorOptions.map((option) => ({
  value: option.value,
  label: h(Tag, { color: option.value }, () => `${option.label} ${option.value}`),
}));
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

<template>
  <Select
    v-model:value="selectedValue"
    :options="colorOptions"
    @change="handleChange"
    class="w-full"
  />
</template>

<style scoped></style>
