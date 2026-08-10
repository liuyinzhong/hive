<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseOrderApi } from '#/api/erp';

import { h } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Input, message, Modal, Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  cancelPurchaseOrderApi,
  closePurchaseOrderApi,
  confirmPurchaseOrderApi,
  getPurchaseOrderListApi,
} from '#/api/erp';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import PurchaseInboundDrawerComponent from '../purchaseInbound/form-drawer.vue';
import {
  purchaseOrderStatusColor,
  purchaseOrderStatusLabel,
} from './constants';
import {
  usePurchaseOrderColumns,
  usePurchaseOrderSearchSchema,
} from './data';
import DetailDrawerComponent from './detail-drawer.vue';
import FormDrawerComponent from './form-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});
const [PurchaseInboundDrawer, purchaseInboundDrawerApi] = useVbenDrawer({
  connectedComponent: PurchaseInboundDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: usePurchaseOrderSearchSchema(),
    showCollapseButton: true,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: usePurchaseOrderColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) =>
          getPurchaseOrderListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'purchaseOrderId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpPurchaseOrderApi.PurchaseOrderListItem>,
});

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openEdit(row: ErpPurchaseOrderApi.PurchaseOrderListItem) {
  formDrawerApi.setData({ purchaseOrderId: row.purchaseOrderId }).open();
}

function openDetail(row: ErpPurchaseOrderApi.PurchaseOrderListItem) {
  detailDrawerApi.setData({ purchaseOrderId: row.purchaseOrderId }).open();
}

function openInbound(row: ErpPurchaseOrderApi.PurchaseOrderListItem) {
  purchaseInboundDrawerApi
    .setData({ purchaseOrderId: row.purchaseOrderId })
    .open();
}

function runConfirm(row: ErpPurchaseOrderApi.PurchaseOrderListItem) {
  Modal.confirm({
    content: $t('erp.purchaseOrder.confirmTip'),
    async onOk() {
      await confirmPurchaseOrderApi(row.purchaseOrderId);
      message.success($t('erp.purchaseOrder.actionSuccess'));
      await gridApi.query();
    },
    title: $t('erp.purchaseOrder.confirm'),
  });
}

function runReasonAction(
  title: string,
  action: (reason: string) => Promise<ErpPurchaseOrderApi.PurchaseOrder>,
) {
  let reason = '';
  Modal.confirm({
    content: () =>
      h(Input.TextArea, {
        maxlength: 500,
        'onUpdate:value': (value?: number | string) => {
          reason = String(value ?? '');
        },
        placeholder: $t('erp.purchaseOrder.reasonRequired'),
        rows: 4,
        showCount: true,
      }),
    async onOk() {
      const value = reason.trim();
      if (!value) {
        message.warning($t('erp.purchaseOrder.reasonRequired'));
        return Promise.reject(new Error('reason required'));
      }
      await action(value);
      message.success($t('erp.purchaseOrder.actionSuccess'));
      await gridApi.query();
    },
    title,
  });
}

function actions(row: ErpPurchaseOrderApi.PurchaseOrderListItem) {
  const result: Record<string, unknown>[] = [
    {
      auth: 'erp:purchaseOrder:detail',
      icon: 'lucide:eye',
      onClick: () => openDetail(row),
      text: $t('common.detail'),
    },
  ];
  if (row.status === 'DRAFT') {
    result.push(
      {
        auth: 'erp:purchaseOrder:update',
        icon: 'lucide:pencil',
        onClick: () => openEdit(row),
        text: $t('common.edit'),
      },
      {
        auth: 'erp:purchaseOrder:confirm',
        icon: 'lucide:badge-check',
        onClick: () => runConfirm(row),
        text: $t('erp.purchaseOrder.confirm'),
      },
      {
        auth: 'erp:purchaseOrder:cancel',
        icon: 'lucide:x-circle',
        onClick: () =>
          runReasonAction($t('erp.purchaseOrder.cancel'), (reason) =>
            cancelPurchaseOrderApi(row.purchaseOrderId, reason),
          ),
        text: $t('erp.purchaseOrder.cancel'),
      },
    );
  }
  if (row.status === 'WAITING_RECEIPT') {
    result.push(
      {
        auth: 'erp:purchaseInbound:create',
        icon: 'lucide:package-plus',
        onClick: () => openInbound(row),
        text: $t('erp.purchaseOrder.receive'),
      },
      {
        auth: 'erp:purchaseOrder:cancel',
        icon: 'lucide:x-circle',
        onClick: () =>
          runReasonAction($t('erp.purchaseOrder.cancel'), (reason) =>
            cancelPurchaseOrderApi(row.purchaseOrderId, reason),
          ),
        text: $t('erp.purchaseOrder.cancel'),
      },
    );
  }
  if (row.status === 'PARTIAL_RECEIPT') {
    result.push(
      {
        auth: 'erp:purchaseInbound:create',
        icon: 'lucide:package-plus',
        onClick: () => openInbound(row),
        text: $t('erp.purchaseOrder.receive'),
      },
      {
        auth: 'erp:purchaseOrder:close',
        icon: 'lucide:archive-x',
        onClick: () =>
          runReasonAction($t('erp.purchaseOrder.close'), (reason) =>
            closePurchaseOrderApi(row.purchaseOrderId, reason),
          ),
        text: $t('erp.purchaseOrder.close'),
      },
    );
  }
  return result;
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <DetailDrawer />
    <PurchaseInboundDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('erp.purchaseOrder.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['erp:purchaseOrder:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('erp.purchaseOrder.create') }}
        </Button>
      </template>
      <template #status="{ row }">
        <Tag :color="purchaseOrderStatusColor(row.status)">
          {{ purchaseOrderStatusLabel(row.status) }}
        </Tag>
      </template>
      <template #action="{ row }">
        <VbenTableAction :actions="actions(row)" align="center" />
      </template>
    </Grid>
  </Page>
</template>
