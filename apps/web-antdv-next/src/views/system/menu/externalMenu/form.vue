<script lang="ts" setup>
import type { ExternalPageApi } from '#/api/system';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $te } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm, z } from '#/adapter/form';
import { createExternalPageApi, updateExternalPageApi } from '#/api/system';
import { $t } from '#/locales';

import { externalRouteCandidates } from '#/router/routes';

function getTranslatedTitle(title?: string) {
  return title && $te(title) ? $t(title) : title;
}

const emit = defineEmits<{ success: [] }>();
const externalPageId = ref<string>();
const isInitializing = ref(false);
const titleSuffix = ref<string>();
const drawerTitle = computed(() =>
  externalPageId.value
    ? $t('system.externalPage.edit')
    : $t('system.externalPage.create'),
);

function updateTitleSuffix(title?: string) {
  titleSuffix.value = title && $te(title) ? $t(title) : undefined;
}

async function fillCandidateFields(name?: string) {
  if (isInitializing.value) return;
  const candidate = externalRouteCandidates.find(
    (route) => route.name === name,
  );
  if (!candidate) return;
  updateTitleSuffix(candidate.title);
  await formApi.setValues({
    name: candidate.name,
    path: candidate.path,
    title: candidate.title,
  });
}

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: [
    {
      component: 'Select',
      componentProps: () => {
        return {
          disabled: !!externalPageId.value,
          onChange: (value?: string) => fillCandidateFields(value),
          options: externalRouteCandidates.map((route) => ({
            label: `${getTranslatedTitle(route.title)} (${route.path})`,
            value: route.name,
          })),
          placeholder: $t('system.externalPage.candidatePlaceholder'),
          showSearch: true,
        };
      },
      fieldName: 'name',
      label: $t('system.externalPage.registeredPage'),
      rules: z.string().min(1),
    },
    {
      component: 'Input',
      componentProps() {
        return {
          maxlength: 128,
          ...(titleSuffix.value && { addonAfter: titleSuffix.value }),
          onChange({ target: { value } }) {
            updateTitleSuffix(value);
          },
        };
      },
      fieldName: 'title',
      label: $t('system.externalPage.title'),
      rules: z.string().min(1).max(128),
    },
    {
      component: 'Input',
      componentProps: { disabled: true },
      fieldName: 'path',
      help: $t('system.externalPage.pathHelp'),
      label: $t('system.externalPage.path'),
      rules: z.string().min(1).max(128),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.externalPage.status'),
    },
  ],
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    try {
      const values =
        await formApi.getValues<ExternalPageApi.SaveExternalPage>();
      await (externalPageId.value
        ? updateExternalPageApi(externalPageId.value, {
            path: values.path,
            title: values.title,
          })
        : createExternalPageApi(values));
      message.success($t('system.externalPage.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data =
      drawerApi.getData<Partial<ExternalPageApi.ExternalPage>>() ?? {};
    externalPageId.value = data.id;
    isInitializing.value = true;
    try {
      await formApi.reset();
      updateTitleSuffix(data.title);
      await formApi.setValues({
        name: data.name,
        path: data.path,
        status: data.status ?? 1,
        title: data.title,
      });
    } finally {
      isInitializing.value = false;
    }
  },
});
</script>

<template>
  <Drawer class="w-[560px]" :title="drawerTitle">
    <Form />
  </Drawer>
</template>
