<script lang="ts" setup>
import { useVbenForm, useVbenModal } from '@vben/common-ui';
import { message } from 'antdv-next';

import { startWorkflowInstanceApi } from '#/api/workflow';
import { $t } from '#/locales';

import { useStartFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

const [Form, formApi] = useVbenForm({
  commonConfig: { colon: true, componentProps: { class: 'w-full' } },
  schema: useStartFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    let variables: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(values.variablesText || '{}');
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error('variables must be an object');
      }
      variables = parsed as Record<string, unknown>;
    } catch {
      message.warning($t('flow.runtime.message.invalidVariables'));
      return;
    }
    modalApi.lock();
    try {
      await startWorkflowInstanceApi({
        businessKey: values.businessKey || undefined,
        definitionId: values.definitionId,
        title: values.title,
        variables,
      });
      message.success($t('flow.runtime.instance.startSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(open) {
    if (open) formApi.resetForm();
  },
  title: $t('flow.runtime.instance.start'),
});
</script>

<template>
  <Modal class="w-[600px]">
    <Form />
  </Modal>
</template>
