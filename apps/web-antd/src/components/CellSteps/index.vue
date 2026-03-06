<template>
  <Steps
    type="inline"
    :current="current"
    :items="items"
    size="small"
    style="width: 100%; height: 50px"
    class="cell-steps"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Steps } from 'ant-design-vue';
import { getLocalDictList } from '#/dicts';

// 定义组件属性
const props = defineProps({
  // 当前状态值
  status: {
    type: String,
    required: true,
    default: '',
  },
  dictType: {
    type: String,
    required: true,
    default: '',
  },
});

const current = computed(() => {
  return items.value.findIndex((item: any) => item.value === props.status);
});

const items = computed(() => {
  return getStepList(props.status);
});

/**
 * 提取数组中匹配的数据及前后一位（最多返回3个）
 * @param {string} target - 要匹配的name值
 * @param {Array} arr - 数据源数组
 * @returns {Array} 匹配结果数组
 */
const getStepList = (target: any): any[] => {
  let arr = getLocalDictList(props.dictType);

  const targetIndex = arr.findIndex((item) => item.value === target);

  // 未找到匹配项，返回空数组
  if (targetIndex === -1) {
    return [];
  }

  // 2. 计算截取的起始位置（核心逻辑）
  let startIndex;
  const arrLength = arr.length;

  // 数组总长度不足3，直接返回全部
  if (arrLength < 3) {
    return [...arr]; // 浅拷贝避免修改原数组
  }

  // 匹配项是第一个元素 → 从0开始取3个
  if (targetIndex === 0) {
    startIndex = 0;
  }
  // 匹配项是最后一个元素 → 从倒数第3个开始取3个
  else if (targetIndex === arrLength - 1) {
    startIndex = arrLength - 3;
  }
  // 匹配项在中间 → 取前1+匹配+后1（共3个）
  else {
    startIndex = targetIndex - 1;
  }

  let newArr: any[] = arr.slice(startIndex, startIndex + 3);
  return newArr.map((item: any) => ({
    title: item.label,
    value: item.value,
  }));
};
</script>

<style scoped lang="scss">
.cell-steps {
  ::v-deep .ant-steps {
    flex: 1;
  }
}
</style>
