<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';
import dayjs from 'dayjs';

import type { VbenFormSchema } from '#/adapter/form';
import { useVbenForm } from '#/adapter/form';
import {
  generateSchedulesApi,
  getScheduleTemplateListApi,
} from '#/api/medical';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();

const schema: VbenFormSchema[] = [
  {
    component: 'ApiSelect',
    componentProps: {
      api: async () => {
        const result = await getScheduleTemplateListApi({
          page: 1,
          pageSize: 100,
          status: 1,
        });
        return result.items;
      },
      labelField: 'templateName',
      mode: 'multiple',
      resultField: '',
      showSearch: true,
      valueField: 'templateId',
    },
    fieldName: 'templateIds',
    formItemClass: 'md:col-span-2',
    label: $t('medical.schedule.templates'),
    rules: 'selectRequired',
  },
  {
    component: 'DatePicker',
    componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
    fieldName: 'startDate',
    label: $t('medical.schedule.startDate'),
    rules: 'selectRequired',
  },
  {
    component: 'DatePicker',
    componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
    fieldName: 'endDate',
    label: $t('medical.schedule.endDate'),
    rules: 'selectRequired',
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const result = await generateSchedulesApi({
        endDate: values.endDate as string,
        idempotencyKey: `manual:${Date.now()}`,
        startDate: values.startDate as string,
        templateIds: values.templateIds as string[],
      });
      message.success(
        $t('medical.schedule.generateResult', [
          result.generatedCount,
          result.skippedCount,
        ]),
      );
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<{ anchorDate?: string }>() ?? {};
    const anchor = dayjs(data.anchorDate);
    const monday = anchor
      .subtract((anchor.day() + 6) % 7, 'day')
      .startOf('day');
    await formApi.resetForm();
    await formApi.setValues({
      endDate: monday.add(6, 'day').format('YYYY-MM-DD'),
      startDate: monday.format('YYYY-MM-DD'),
    });
  },
});
</script>

<template>
  <Drawer class="w-[680px]" :title="$t('medical.schedule.generate')">
    <Form />
  </Drawer>
</template>
