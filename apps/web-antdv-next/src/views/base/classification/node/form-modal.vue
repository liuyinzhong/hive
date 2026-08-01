<script lang="ts" setup>
import type { BaseClassificationApi } from '#/api/base';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createClassificationNodeApi,
  updateClassificationNodeApi,
} from '#/api/base';
import { $t } from '#/locales';

import { useClassificationNodeFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

/** 当前节点编辑数据 */
const formData = ref<{
  classificationNodeId?: string;
  classificationSystemId?: string;
  parentId?: null | string;
  rowVersion?: number;
  systemCode?: string;
}>({});

/** 当前体系编码，供父节点树选择接口使用 */
const systemCode = ref('');
const title = computed(() =>
  formData.value?.classificationNodeId
    ? $t('base.classification.nodeEdit')
    : $t('base.classification.nodeCreate'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useClassificationNodeFormSchema(() => systemCode.value),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        classificationSystemId: formData.value.classificationSystemId,
        expectedRowVersion: formData.value.rowVersion,
      } as BaseClassificationApi.SaveClassificationNode;
      await (formData.value?.classificationNodeId
        ? updateClassificationNodeApi(
            formData.value.classificationNodeId,
            payload,
          )
        : createClassificationNodeApi(payload));
      message.success($t('base.classification.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = modalApi.getData<Partial<BaseClassificationApi.ClassificationNode> & {
      systemCode?: string;
    }>() ?? {};
    formData.value = {
      classificationNodeId: data.classificationNodeId,
      classificationSystemId: data.classificationSystemId,
      parentId: data.parentId ?? undefined,
      rowVersion: data.rowVersion,
      systemCode: data.systemCode,
    };
    systemCode.value = data.systemCode ?? '';
    await formApi.reset();
    await formApi.setValues({
      sort: 0,
      status: 1,
      ...data,
    });
  },
});
</script>

<template>
  <Modal :title="title">
    <Form class="mx-4" />
  </Modal>
</template>
