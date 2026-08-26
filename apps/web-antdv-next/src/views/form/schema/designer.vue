<script lang="ts" setup>
import type { PersistentFormSchema } from '#/utils/form-schema';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Button, message, Space, TabPane, Tabs } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { getFormSchemaDetailApi, updateFormSchemaApi } from '#/api/form';
import { $t } from '#/locales';
import {
  compileVbenFormSchema,
  getFormSchemaWrapperClass,
  normalizeFormSchemaLayout,
} from '#/utils/form-schema';

import FormSchemaDesigner from './components/form-schema-designer.vue';

defineOptions({ name: 'FormSchemaDesignerPage' });

const route = useRoute();
const router = useRouter();
const formSchemaId = String(route.params.formSchemaId ?? '');
const loading = ref(false);
const activeTab = ref('design');
const schema = ref<PersistentFormSchema[]>([]);
const record = ref<Awaited<ReturnType<typeof getFormSchemaDetailApi>>>();
const formLayout = computed(() =>
  normalizeFormSchemaLayout(record.value?.layout),
);

const [PreviewForm, previewFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: getFormSchemaWrapperClass(),
});

watch(
  [schema, formLayout],
  ([value, layout]) => {
    try {
      previewFormApi.setState({
        schema: compileVbenFormSchema(value),
        wrapperClass: getFormSchemaWrapperClass(layout),
      });
    } catch {
      previewFormApi.setState({ schema: [] });
    }
  },
  { deep: true },
);

onMounted(loadSchema);

async function loadSchema() {
  loading.value = true;
  try {
    const detail = await getFormSchemaDetailApi(formSchemaId);
    schema.value = structuredClone(detail.schema);
    record.value = detail;
  } finally {
    loading.value = false;
  }
}

async function saveSchema() {
  if (!record.value) return;
  compileVbenFormSchema(schema.value);
  await updateFormSchemaApi(formSchemaId, {
    category: record.value.category,
    layout: formLayout.value,
    remark: record.value.remark,
    schema: schema.value,
    schemaName: record.value.schemaName,
    status: record.value.status,
  });
  message.success($t('form.messages.saveSuccess'));
}
</script>

<template>
  <Page
    :auto-content-height="true"
    :title="record?.schemaName || $t('form.designer.title')"
  >
    <template #extra>
      <Space>
        <Button @click="router.back()">{{ $t('form.actions.back') }}</Button>
        <Button type="primary" @click="saveSchema">
          {{ $t('form.actions.save') }}
        </Button>
      </Space>
    </template>
    <Tabs v-model:active-key="activeTab" class="schema-tabs">
      <TabPane key="design" :tab="$t('form.designer.design')">
        <FormSchemaDesigner v-model="schema" :layout="formLayout" />
      </TabPane>
      <TabPane key="preview" :tab="$t('form.designer.preview')">
        <div class="preview-container"><PreviewForm /></div>
      </TabPane>
    </Tabs>
  </Page>
</template>

<style scoped>
.schema-tabs {
  height: 100%;
}

.schema-tabs :deep(.ant-tabs-content-holder),
.schema-tabs :deep(.ant-tabs-content),
.schema-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
  min-height: 0;
}

.preview-container {
  max-width: 960px;
  padding: 24px;
  margin: 0 auto;
}
</style>
