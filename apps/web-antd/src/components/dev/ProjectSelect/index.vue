<template>
  <div>
    <a-cascader
      v-model:value="selectedValue"
      :options="options"
      style="width: 100%"
      @change="handleChange"
      ref="selectRef"
    />
    <FormModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue';
import { faker } from '@faker-js/faker';
import addFormModal from '#/views/dev/versions/add-modal.vue';
import { useVbenModal } from '@vben/common-ui';
const emit = defineEmits(['update:projectId', 'update:versionId', 'change']);

const props = defineProps({
  modelValue: String,
  /** 是否显示添加版本选项 */
  showAddVersion: Boolean,
  /** 是否显示添加项目选项 */
  showAddProject: Boolean,
});

const options = ref<any>();

const selectedValue = ref<any>([]);

const selectRef = ref();

onMounted(() => {
  init();
});
onUnmounted(() => {});

const init = () => {
  options.value = [
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
  ];

  selectedValue.value = [
    options.value[0].value,
    options.value[0].children[0].value,
  ];

  handleChange([options.value[0].value, options.value[0].children[0].value]);
  if (props.showAddVersion) {
    options.value.forEach((item: any) => {
      (item.children || []).unshift({
        value: '添加版本',
        label: '添加版本',
      });
    });
  }
  if (props.showAddProject) {
    options.value.unshift({
      value: '添加项目',
      label: '添加项目',
    });
  }
};

const [FormModal, FormModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
  onClosed: () => {
    init();
  },
});

const handleChange = (value: any) => {
  if (value[0] == '添加项目' || value[1] == '添加版本') {
    if (value[0] == '添加项目') {
      //
    } else if (value[1] == '添加版本') {
      selectRef.value.blur();
      FormModalApi.setData({
        projectId: value[0],
      }).open();
    }
  }
  emit('update:projectId', value[0]);
  emit('update:versionId', value[1]);
  emit('change', value);
};
</script>
