<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm, z } from '#/adapter/form';
import { $t } from '#/locales';

interface TraceCodeFormItem {
  traceCode: string;
}

interface TraceCodeFormValues {
  items: TraceCodeFormItem[];
}

interface TraceCodeModalData {
  codes?: string[];
  contextLabel?: string;
}

const emit = defineEmits<{ success: [codes: string[]] }>();
const contextLabel = ref('');
const title = computed(() =>
  contextLabel.value
    ? `${$t('erp.traceCode.inputTitle')}：${contextLabel.value}`
    : $t('erp.traceCode.inputTitle'),
);

const schema: VbenFormSchema<TraceCodeFormValues>[] = [
  {
    arrayProps: {
      addButtonText: $t('erp.traceCode.add'),
      createRow: () => ({ traceCode: '' }),
      max: 9999,
      min: 1,
    },
    children: [
      {
        component: 'Input',
        componentProps: (ctx) => ({
          maxlength: 64,
          placeholder: `${$t('erp.traceCode.code')} ${(ctx.rowIndex ?? 0) + 1}`,
        }),
        fieldName: 'traceCode',
        label: $t('erp.traceCode.code'),
        rules: z
          .string()
          .trim()
          .min(1, $t('erp.traceCode.required'))
          .regex(/^\d+$/, $t('erp.traceCode.digitsOnly')),
      },
    ],
    defaultValue: [{ traceCode: '' }],
    fieldName: 'items',
    label: $t('erp.traceCode.codes'),
    type: 'array',
  },
];

const [Form, formApi] = useVbenForm<TraceCodeFormValues>({
  commonConfig: { componentProps: { class: 'w-full' }, labelWidth: 80 },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const codes = values.items.map((item) => item.traceCode.trim());
    const seen = new Set<string>();
    const duplicate = codes.find((code) => {
      if (seen.has(code)) return true;
      seen.add(code);
      return false;
    });
    if (duplicate) {
      message.error($t('erp.traceCode.duplicate', [duplicate]));
      return;
    }
    emit('success', codes);
    modalApi.close();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = modalApi.getData<TraceCodeModalData>();
    contextLabel.value = data.contextLabel || '';
    const codes = data.codes || [];
    await formApi.reset();
    await formApi.setValues({
      items: (codes.length > 0 ? codes : ['']).map((traceCode) => ({
        traceCode,
      })),
    });
  },
});
</script>

<template>
  <Modal class="w-[680px]" :title="title">
    <Form />
  </Modal>
</template>
