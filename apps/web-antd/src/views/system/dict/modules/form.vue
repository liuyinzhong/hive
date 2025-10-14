<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDept, updateDept } from '#/api/system/dept';
import { $t } from '#/locales';
import type { DictFace } from '#/dicts';

const emit = defineEmits(['success']);
const formData = ref<DictFace>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dict.name')])
    : $t('ui.actionTitle.create', [$t('system.dict.name')]);
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  wrapperClass: 'grid-cols-2 gap-x-4',
  schema: [
    {
      component: 'Input',
      fieldName: 'pid',
      label: '父级',
      disabled: true,
      formItemClass: 'col-span-2 md:col-span-2',
      dependencies: {
        show(values) {
          return !!values.pid;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: '字典类型',
      formItemClass: 'col-span-2 md:col-span-2',
      defaultValue: '',
      dependencies: {
        disabled(values) {
          return !!values.pid;
        },
        rules(values) {
          if (!values.pid) {
            return 'required';
          }
          return null;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'Input',
      fieldName: 'label',
      label: '字典标题',
      rules: 'required',
      defaultValue: '',
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: '字典值',
      rules: 'required',
      defaultValue: '',
      dependencies: {
        show(values) {
          return !!values.pid;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'ColorSelect',
      fieldName: 'color',
      label: '颜色',
      defaultValue: 'default',
      componentProps: {},
      dependencies: {
        show(values) {
          return !!values.pid;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'disabled',
      label: '禁用状态',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      formItemClass: 'col-span-2 md:col-span-2',
      defaultValue: '',
    },
  ],
  showDefaultActions: false,
});

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      console.log(data);
      modalApi.close();
      emit('success');
      modalApi.lock(false);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<DictFace>();
      if (data) {
        if (data.pid == 0) {
          data.pid = undefined;
        }
        formData.value = data;
        formApi.setValues(formData.value);
      }
    }
  },
});
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
