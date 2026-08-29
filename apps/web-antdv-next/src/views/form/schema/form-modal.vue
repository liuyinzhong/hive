<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import type { FormSchemaApi } from '#/api/form';
import { createFormSchemaApi, updateFormSchemaApi } from '#/api/form';
import { $t } from '#/locales';

import { useFormSchemaBaseForm } from './data';

const emit = defineEmits<{ success: [] }>();

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: onSubmit,
  schema: useFormSchemaBaseForm(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  onConfirm: () => formApi.validateAndSubmit(),
  async onOpenChange(open) {
    if (!open) return;
    await formApi.reset();
    const data = modalApi.getData<FormSchemaApi.FormSchemaRecord>();
    modalApi.setState({
      title: data?.formSchemaId
        ? $t('form.actions.editSchema')
        : $t('form.actions.createSchema'),
    });
    if (data) await formApi.setValues(data);
  },
});

async function onSubmit(values: Record<string, unknown>) {
  modalApi.lock();
  try {
    const existing = modalApi.getData<FormSchemaApi.FormSchemaRecord>();
    const formSchemaId = existing?.formSchemaId;
    const payload: FormSchemaApi.FormSchemaPayload = {
      category: String(values.category ?? '') || undefined,
      layout: String(
        values.layout ?? 'single',
      ) as FormSchemaApi.FormSchemaPayload['layout'],
      remark: String(values.remark ?? '') || undefined,
      schema: existing?.schema ?? [],
      schemaName: String(values.schemaName ?? ''),
      status: String(values.status ?? '1'),
    };
    await (formSchemaId
      ? updateFormSchemaApi(formSchemaId, payload)
      : createFormSchemaApi(payload));
    message.success($t('form.messages.saveSuccess'));
    modalApi.close();
    emit('success');
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal class="w-[520px]">
    <Form />
  </Modal>
</template>
