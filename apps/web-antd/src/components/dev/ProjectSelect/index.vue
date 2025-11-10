<template>
  <a-cascader
    v-model:value="selectedValue"
    :options="options"
    style="width: 100%"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { faker } from '@faker-js/faker';

const emit = defineEmits(['update:projectId', 'update:versionId', 'change']);

const props = defineProps({
  modelValue: String,
});

onMounted(() => {
  handleChange([options.value[0].value, options.value[0].children[0].value]);
});
onUnmounted(() => {});

const options = ref<any>([
  {
    value: faker.string.uuid(),
    label: '岭南医药网',
    children: [
      {
        value: faker.string.uuid(),
        label: '1.0.0',
      },
      {
        value: faker.string.uuid(),
        label: '2.0.0',
      },
      {
        value: faker.string.uuid(),
        label: '3.0.0',
      },
    ],
  },
  {
    value: faker.string.uuid(),
    label: '医陪护',
    children: [
      {
        value: faker.string.uuid(),
        label: '1.0.0',
      },
      {
        value: faker.string.uuid(),
        label: '2.0.0',
      },
    ],
  },
  {
    value: faker.string.uuid(),
    label: '供应商协同',
    children: [
      {
        value: faker.string.uuid(),
        label: '1.1.0',
      },
      {
        value: faker.string.uuid(),
        label: '2.2.0',
      },
    ],
  },
]);

const selectedValue = ref(
  props.modelValue || [
      options.value[0].value,
      options.value[0].children[0].value,
    ] ||
    '',
);
const selectRef = ref();

const handleChange = (value: any) => {
  emit('update:projectId', value[0]);
  emit('update:versionId', value[1]);
  emit('change', value);
};
</script>
