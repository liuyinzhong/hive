<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Button, Empty, Space, Spin, message } from 'antdv-next';

import { getPurchaseInboundPrintDocumentApi } from '#/api/print';
import type { PrintDocumentBundle } from '#/api/print';
import { $t } from '#/locales';

import PrintRenderer from './management/components/print-renderer.vue';

defineOptions({ name: 'PrintPreview' });

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const bundle = ref<PrintDocumentBundle>();

onMounted(loadPrintDocument);

async function loadPrintDocument() {
  const inboundId = String(route.query.inboundId ?? '');
  if (!inboundId) {
    loading.value = false;
    message.error($t('print.messages.documentMissing'));
    return;
  }
  try {
    bundle.value = await getPurchaseInboundPrintDocumentApi(inboundId);
  } finally {
    loading.value = false;
  }
}

function printPage() {
  window.print();
}
</script>

<template>
  <Page
    class="print-preview-page"
    header-class="print-page-header"
    :title="$t('print.preview.title')"
  >
    <template #extra>
      <Space class="print-preview-actions">
        <Button @click="router.back()">{{ $t('print.actions.back') }}</Button>
        <Button v-if="bundle" type="primary" @click="printPage">
          {{ $t('print.actions.print') }}
        </Button>
      </Space>
    </template>
    <Spin :spinning="loading">
      <PrintRenderer
        v-if="bundle"
        :data="bundle.data"
        :layout="bundle.template.publishedLayout || bundle.template.draftLayout"
      />
      <Empty v-else :description="$t('print.preview.empty')" />
    </Spin>
  </Page>
</template>

<style scoped>
@media print {
  .print-preview-page :deep(.print-page-header),
  .print-preview-actions {
    display: none;
  }
}
</style>
