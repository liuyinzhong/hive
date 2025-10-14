<template>
  <a-select ref="select" v-model:value="value1" @change="handleChange">
    <a-select-option
      v-for="item in options"
      :key="item.userId"
      :value="item.userId"
    >
      <div class="flex items-center">
        <a-avatar :src="item.avatar" size="small"> </a-avatar>
        <span style="margin-left: 5px">{{ item.realName }}</span>
      </div>
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue', 'update:userId']);

const { modelValue } = defineProps({
  modelValue: String, // 双向绑定的值
});

const value1 = ref(modelValue);

const options = ref([
  {
    avatar: 'https://picsum.photos/30/30',
    realName: '张三',
    userId: '001',
  },
  {
    avatar: 'https://picsum.photos/30/30',
    realName: '李四',
    userId: '002',
  },
  {
    avatar: 'https://picsum.photos/30/30',
    realName: '王五',
    userId: '003',
  },
]);

const handleChange = (value: string) => {
  emit('update:modelValue', value);
  emit('update:userId', value);
};
onMounted(() => {});

onUnmounted(() => {});
</script>
