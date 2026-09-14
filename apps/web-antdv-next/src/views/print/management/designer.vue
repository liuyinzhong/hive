<script lang="ts" setup>
import type { PrintBusinessField } from '@worm-vue3-print/canvas';
import type { ErpPurchaseInboundApi } from '#/api/erp';

import type {
  PrintDocumentData,
  PrintTemplateDetail,
  PrintTemplateMetadata,
  TemplateData,
} from '#/api/print';

import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Button, Input, Select, Space, Spin, Tag, message } from 'antdv-next';

import {
  PrintDesigner,
  PrintHtmlPreview,
} from '@worm-vue3-print/canvas';

import {
  getPurchaseInboundPrintDataApi,
  getPrintTemplateDetailApi,
  getPrintTemplateMetadataApi,
  publishPrintTemplateApi,
  updatePrintTemplateApi,
} from '#/api/print';
import { getPurchaseInboundListApi } from '#/api/erp';
import { $t } from '#/locales';

import { createDefaultPrintTemplate } from './default-layout';

defineOptions({ name: 'PrintTemplateDesigner' });

const route = useRoute();
const router = useRouter();
const { hasAccessByCodes } = useAccess();

const templateId = String(route.query.templateId ?? '');
const loading = ref(true);
const saving = ref(false);
const template = ref<PrintTemplateDetail>();
const metadata = ref<PrintTemplateMetadata>();

const designerRef = ref<InstanceType<typeof PrintDesigner>>();
const previewRef = ref<InstanceType<typeof PrintHtmlPreview>>();

// 免保存预览：画布当前 JSON + 真实单据数据
const previewVisible = ref(false);
const previewTemplate = ref<null | TemplateData>(null);
const previewData = ref<PrintDocumentData>();
const previewInboundId = ref('');
const previewInboundOptions = ref<Array<{ label: string; value: string }>>([]);
const previewLoading = ref(false);

// 注册表字段 → worm 设计器字段树；items 根（list）作为明细表格数据源
const businessFields = computed<PrintBusinessField[]>(() => {
  const fields = metadata.value?.fieldGroups.flatMap((group) => group.fields);
  if (!fields) return [];
  return fields.map((field, index) => ({
    fieldKey: field.path,
    fieldLabel: field.label,
    fieldType: field.dataType,
    id: field.path,
    sortOrder: index + 1,
  }));
});

watch(previewVisible, async (value) => {
  if (value) await loadPreviewOptions();
});

onMounted(loadDesigner);

async function loadDesigner() {
  if (!templateId) {
    message.error($t('print.messages.templateMissing'));
    router.back();
    return;
  }
  loading.value = true;
  try {
    const [detail, fields] = await Promise.all([
      getPrintTemplateDetailApi(templateId),
      getPrintTemplateMetadataApi(),
    ]);
    template.value = detail;
    metadata.value = fields;
  } finally {
    loading.value = false;
  }
}

async function saveDraft(showMessage = true, json?: string) {
  if (!template.value || !hasAccessByCodes(['print:template:update'])) {
    message.warning($t('print.messages.noUpdatePermission'));
    return false;
  }
  const raw = json ?? designerRef.value?.getTemplateJson();
  if (!raw) {
    message.error($t('print.messages.saveFailed'));
    return false;
  }
  saving.value = true;
  try {
    const updated = await updatePrintTemplateApi(templateId, {
      draftLayout: toRawTemplate(raw),
      rowVersion: template.value.rowVersion,
      templateName: template.value.templateName.trim(),
    });
    template.value = updated;
    if (showMessage) message.success($t('print.messages.saveSuccess'));
    return true;
  } finally {
    saving.value = false;
  }
}

async function publishDraft() {
  if (!template.value || !hasAccessByCodes(['print:template:publish'])) return;
  if (!(await saveDraft(false)) || !template.value) return;
  saving.value = true;
  try {
    const published = await publishPrintTemplateApi(
      templateId,
      template.value.rowVersion,
    );
    template.value = published;
    message.success($t('print.messages.publishSuccess'));
  } finally {
    saving.value = false;
  }
}

function toRawTemplate(json: string | TemplateData): TemplateData {
  return typeof json === 'string' ? (JSON.parse(json) as TemplateData) : json;
}

/** worm 工具栏「加载默认布局」回调 */
function loadDefaultTemplate() {
  return createDefaultPrintTemplate();
}

function printPreview() {
  previewRef.value?.print();
}

async function openPreview() {
  const json = designerRef.value?.getTemplateJson();
  if (!json) return;
  previewTemplate.value = toRawTemplate(json);
  previewVisible.value = true;
}

async function loadPreviewOptions() {  if (previewInboundOptions.value.length > 0) return;
  if (!hasAccessByCodes(['erp:purchaseInbound:list'])) return;
  try {
    const result = await getPurchaseInboundListApi({ page: 1, pageSize: 20 });
    previewInboundOptions.value = result.items.map(
      (item: ErpPurchaseInboundApi.PurchaseInboundListItem) => ({
        label: `${item.inboundNo} / ${item.supplierName} / ${item.inboundDate}`,
        value: item.inboundId,
      }),
    );
  } catch {
    previewInboundOptions.value = [];
  }
}

async function loadPreviewData() {
  if (!previewInboundId.value) return;
  previewLoading.value = true;
  try {
    previewData.value = await getPurchaseInboundPrintDataApi(
      previewInboundId.value,
    );
  } finally {
    previewLoading.value = false;
  }
}
</script>

<template>
  <Page
    auto-content-height
    class="print-designer-page"
    header-class="print-page-header"
    :title="template?.templateName || $t('print.designer.title')"
  >
    <template #extra>
      <Space>
        <Input
          v-if="template"
          v-model:value="template.templateName"
          class="w-[220px]"
        />
        <Tag
          v-if="template"
          :color="template.status === 'PUBLISHED' ? 'success' : 'default'"
        >
          {{
            template.status === 'PUBLISHED'
              ? $t('print.template.statusPublished')
              : $t('print.template.statusDraft')
          }}
        </Tag>
        <Button @click="router.back()">{{ $t('print.actions.back') }}</Button>
        <Button
          :disabled="!hasAccessByCodes(['print:template:update'])"
          :loading="saving"
          @click="saveDraft()"
        >
          {{ $t('print.actions.saveDraft') }}
        </Button>
        <Button
          v-if="hasAccessByCodes(['print:template:publish'])"
          :loading="saving"
          type="primary"
          @click="publishDraft"
        >
          {{ $t('print.actions.publish') }}
        </Button>
      </Space>
    </template>

    <Spin :spinning="loading">
      <div v-if="template" class="designer-host">
        <PrintDesigner
          ref="designerRef"
          :fields="businessFields"
          :initial-template="template.draftLayout"
          :is-edit="true"
          :load-default-template="loadDefaultTemplate"
          @preview="openPreview"
          @save="(json: string) => saveDraft(true, json)"
        />

        <Teleport to="body">
          <div
            v-if="previewVisible"
            class="preview-mask"
            @click.self="previewVisible = false"
          >
            <div class="preview-panel">
              <div class="preview-toolbar">
                <Select
                  v-if="previewInboundOptions.length > 0"
                  v-model:value="previewInboundId"
                  allow-clear
                  class="min-w-[320px]"
                  :options="previewInboundOptions"
                  :placeholder="$t('print.preview.selectDocument')"
                  show-search
                  @change="loadPreviewData"
                />
                <Input
                  v-else
                  v-model:value="previewInboundId"
                  class="min-w-[320px]"
                  :placeholder="$t('print.preview.documentIdPlaceholder')"
                  @press-enter="loadPreviewData"
                />
                <Button :loading="previewLoading" @click="loadPreviewData">
                  {{ $t('print.preview.load') }}
                </Button>
                <Button
                  v-if="previewData"
                  type="primary"
                  @click="printPreview"
                >
                  {{ $t('print.actions.print') }}
                </Button>
                <Button @click="previewVisible = false">
                  {{ $t('print.actions.backToDesign') }}
                </Button>
              </div>
              <div class="preview-body">
                <PrintHtmlPreview
                  v-if="previewData && previewTemplate"
                  ref="previewRef"
                  :print-data="previewData"
                  :template-json="previewTemplate"
                />
                <div v-else class="preview-empty">
                  {{ $t('print.preview.empty') }}
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </Spin>
  </Page>
</template>

<style scoped>
.designer-host {
  height: 100%;
  min-height: 560px;
}

.preview-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  background: rgb(15 23 42 / 45%);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  width: min(960px, 92vw);
  margin: 24px 0;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
}

.preview-toolbar {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #f1f5f9;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
}
</style>
