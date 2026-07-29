<script lang="ts" setup>
import type { ProductSpuApi } from '#/api/product';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button, Card, message, Space, Spin } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  createProductSpuApi,
  getProductSpuDetailApi,
  updateProductSpuApi,
} from '#/api/product';
import { $t } from '#/locales';

import MpFormModalComponent from './components/mp/mp-form-modal.vue';
import RpFormModalComponent from './components/rp/rp-form-modal.vue';
import SkuFormModalComponent from './components/sku/sku-form-modal.vue';
import type { ProductSpuDetailGridRow } from './components/structure/structure-data';
import {
  calcStructureRowspan,
  getStructureMergeKeyField,
  useProductSpuStructureColumns,
} from './components/structure/structure-data';
import { useProductSpuFormSchema } from './data';

const route = useRoute();
const router = useRouter();
const { hasAccessByCodes } = useAccess();
const { closeTabByKey } = useTabs();

type SpanMethodParams = Parameters<
  NonNullable<VxeTableGridOptions<ProductSpuDetailGridRow>['spanMethod']>
>[0];

const detail = ref<ProductSpuApi.ProductSpuDetail>();
const loading = ref(false);

const routeSpuId = computed(() => String(route.params.spuId || 'create'));
const isCreate = computed(() => routeSpuId.value === 'create');
const pageTitle = computed(() =>
  isCreate.value
    ? $t('product.spu.create')
    : `${detail.value?.productName || $t('product.spu.edit')}（${detail.value?.spuCode || '-'}）`,
);

const [RpFormModal, rpFormModalApi] = useVbenModal({
  connectedComponent: RpFormModalComponent,
  destroyOnClose: true,
});
const [MpFormModal, mpFormModalApi] = useVbenModal({
  connectedComponent: MpFormModalComponent,
  destroyOnClose: true,
});
const [SkuFormModal, skuFormModalApi] = useVbenModal({
  connectedComponent: SkuFormModalComponent,
  destroyOnClose: true,
});

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useProductSpuFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
});

const [Grid, gridApi] = useVbenVxeGrid<ProductSpuDetailGridRow>({
  gridOptions: {
    columns: useProductSpuStructureColumns(),
    height: 'auto',
    pagerConfig: { enabled: false },
    rowConfig: {
      isHover: true,
      isCurrent: true,
      keyField: 'rowKey',
    },
    showOverflow: true,
    spanMethod(params: SpanMethodParams) {
      const { column, rowIndex, visibleData } = params;
      const keyField = getStructureMergeKeyField(column.field);
      if (!keyField) return undefined;

      const rowspan = calcStructureRowspan(
        visibleData as ProductSpuDetailGridRow[],
        rowIndex,
        keyField,
      );
      return rowspan === 0
        ? { colspan: 0, rowspan: 0 }
        : { colspan: 1, rowspan };
    },
    toolbarConfig: { custom: true, zoom: true },
  },
  tableData: [],
});

function buildGridRows(rows: ProductSpuApi.ProductSpuDetailRow[]) {
  return rows.map((row, index) => ({
    ...row,
    rowKey: row.skuId || row.mpId || row.rpId || `${row.spuId}-${index}`,
  }));
}

async function loadDetail() {
  if (isCreate.value) {
    detail.value = undefined;
    await formApi.reset();
    await formApi.setValues({ productType: 'DRUG', status: 1 });
    await gridApi.grid?.loadData?.([]);
    return;
  }

  loading.value = true;
  try {
    const result = await getProductSpuDetailApi(routeSpuId.value);
    detail.value = result;
    await formApi.reset();
    await formApi.setValues(result);
    await nextTick();
    await gridApi.grid?.loadData?.(buildGridRows(result.rows || []));
  } finally {
    loading.value = false;
  }
}

async function saveSpu() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const createTabKey = isCreate.value ? route.fullPath : '';
    const values = await formApi.getValues();
    const payload = {
      ...values,
      expectedRowVersion: detail.value?.rowVersion,
    } as ProductSpuApi.SaveProductSpu;
    const saved = isCreate.value
      ? await createProductSpuApi(payload)
      : await updateProductSpuApi(routeSpuId.value, payload);

    message.success($t('product.spu.saveSuccess'));
    if (isCreate.value) {
      await router.replace({
        name: 'productSpuDetail',
        params: { spuId: saved.spuId },
      });
      await nextTick();
      await closeTabByKey(createTabKey);
      return;
    }
    await loadDetail();
  } finally {
    loading.value = false;
  }
}

function backToList() {
  router.push('/product/spu');
}

function openCreateRp() {
  if (!detail.value) return;
  rpFormModalApi.setData({ spuId: detail.value.spuId }).open();
}

function openEditRp(row: ProductSpuDetailGridRow) {
  if (!detail.value || !row.rpId) return;
  rpFormModalApi.setData({ rpId: row.rpId, spuId: detail.value.spuId }).open();
}

function openCreateMp(row: ProductSpuDetailGridRow) {
  if (!row.rpId) return;
  mpFormModalApi.setData({ rpId: row.rpId }).open();
}

function openEditMp(row: ProductSpuDetailGridRow) {
  if (!row.rpId || !row.mpId) return;
  mpFormModalApi.setData({ mpId: row.mpId, rpId: row.rpId }).open();
}

function openCreateSku(row: ProductSpuDetailGridRow) {
  if (!row.mpId) return;
  skuFormModalApi.setData({ mpId: row.mpId }).open();
}

function openEditSku(row: ProductSpuDetailGridRow) {
  if (!row.mpId || !row.skuId) return;
  skuFormModalApi.setData({ mpId: row.mpId, skuId: row.skuId }).open();
}

watch(routeSpuId, loadDetail);

onMounted(loadDetail);
</script>

<template>
  <Page>
    <RpFormModal @success="loadDetail" />
    <MpFormModal @success="loadDetail" />
    <SkuFormModal @success="loadDetail" />

    <div class="product-detail space-y-4">
      <Card>
        <template #title>
          <div class="title-block">
            <Button @click="backToList">
              <IconifyIcon class="size-4" icon="lucide:arrow-left" />
              {{ $t('product.spu.backList') }}
            </Button>
            <div>
              <div class="title">{{ pageTitle }}</div>
            </div>
          </div>
        </template>

        <template #extra>
          <Space>
            <Button
              v-if="
                hasAccessByCodes([
                  isCreate ? 'product:spu:create' : 'product:spu:update',
                ])
              "
              :loading="loading"
              type="primary"
              @click="saveSpu"
            >
              <IconifyIcon class="size-4" icon="lucide:save" />
              {{ $t('product.spu.saveSpu') }}
            </Button>
          </Space>
        </template>

        <Spin :spinning="loading">
          <Form />
        </Spin>
      </Card>

      <Card :title="$t('product.spu.structure')">
        <template #extra>
          <Button
            v-if="detail && hasAccessByCodes(['product:rp:create'])"
            type="primary"
            @click="openCreateRp"
          >
            <Plus class="size-4" />
            {{ $t('product.rp.create') }}
          </Button>
        </template>
        <Spin :spinning="loading">
          <Grid :table-title="pageTitle">
            <template #toolbar-tools> </template>

            <template #rpCode="{ row }">
              {{ row.rpCode }}
              <Button
                v-if="row.rpId"
                size="small"
                type="link"
                @click="openEditRp(row)"
                v-access:code="['product:rp:update']"
              >
                {{ $t('product.rp.edit') }}
              </Button>
            </template>
            <template #rpAction="{ row }">
              <Button
                size="small"
                type="link"
                @click="openCreateMp(row)"
                v-access:code="['product:mp:create']"
              >
                {{ $t('product.mp.addTitle') }}
              </Button>
            </template>

            <template #mpCode="{ row }">
              {{ row.mpCode }}
              <Button
                v-if="row.mpId"
                size="small"
                type="link"
                @click="openEditMp(row)"
                v-access:code="['product:mp:update']"
              >
                {{ $t('product.mp.edit') }}
              </Button>
            </template>
            <template #mpAction="{ row }">
              <Button
                v-if="row.mpId"
                size="small"
                type="link"
                @click="openCreateSku(row)"
                v-access:code="['product:sku:create']"
              >
                {{ $t('product.sku.addTitle') }}
              </Button>
            </template>

            <template #skuAction="{ row }">
              <Button
                v-if="row.skuId"
                size="small"
                type="link"
                @click="openEditSku(row)"
                v-access:code="['product:sku:update']"
              >
                {{ $t('product.sku.edit') }}
              </Button>
            </template>
          </Grid>
        </Spin>
      </Card>
    </div>
  </Page>
</template>

<style scoped>
.product-detail {
  min-height: 100%;
}

.title-block {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
