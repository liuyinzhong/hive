<script lang="ts" setup>
import type { VxeTableGridOptions } from "#/adapter/vxe-table";
import type { ExternalPageApi } from "#/api/system";

import { useVbenDrawer } from "@vben/common-ui";
import { Plus } from "@vben/icons";
import { $te } from "@vben/locales";

import { Button, message, Modal, Space } from "antdv-next";

import { useVbenVxeGrid, VbenTableAction } from "#/adapter/vxe-table";
import { deleteExternalPagesApi, getExternalPageListApi } from "#/api/system";
import { $t } from "#/locales";
import { router } from "#/router";

import { useExternalPageColumns, useExternalPageSearchSchema } from "./data";
import ExternalPageForm from "./form.vue";

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: ExternalPageForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useExternalPageSearchSchema(),
    wrapperClass: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  },
  gridOptions: {
    checkboxConfig: { highlight: true },
    columns: useExternalPageColumns(),
    height: "auto",
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Record<string, any>) =>
          getExternalPageListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
    rowConfig: { keyField: "id" },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ExternalPageApi.ExternalPage>,
});

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openEdit(row: ExternalPageApi.ExternalPage) {
  formDrawerApi.setData({ ...row }).open();
}

async function copyAddress(row: ExternalPageApi.ExternalPage) {
  await navigator.clipboard.writeText(
    new URL(router.resolve(row.path).href, window.location.origin).toString(),
  );
  message.success($t("system.externalPage.copySuccess"));
}

async function removeRows(rows: ExternalPageApi.ExternalPage[]) {
  await deleteExternalPagesApi(rows.map((row) => row.id));
  message.success($t("system.externalPage.deleteSuccess"));
  gridApi.query();
}

function removeSelected() {
  const rows = gridApi.grid.getCheckboxRecords();
  if (rows.length === 0) {
    message.warning($t("system.externalPage.selectAtLeastOne"));
    return;
  }
  Modal.confirm({
    content: $t("system.externalPage.batchDeleteConfirm", [rows.length]),
    onOk: () => removeRows(rows),
    title: $t("system.externalPage.delete"),
  });
}
</script>

<template>
  <div class="h-[calc(100%_-_30px)]">
    <FormDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('system.externalPage.list')">
      <template #toolbar-tools>
        <Space>
          <Button v-access:code="['system:externalPage:delete']" danger @click="removeSelected">
            {{ $t("system.externalPage.batchDelete") }}
          </Button>
          <Button v-access:code="['system:externalPage:create']" type="primary" @click="openCreate">
            <Plus class="size-5" />
            {{ $t("system.externalPage.create") }}
          </Button>
        </Space>
      </template>
      <template #title="{ row }">
        {{ row.title && $te(row.title) ? $t(row.title) : row.title }}
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'system:externalPage:update',
              icon: 'lucide:edit',
              text: $t('system.externalPage.edit'),
              onClick: () => openEdit(row),
            },
            {
              icon: 'lucide:copy',
              text: $t('system.externalPage.copyAddress'),
              onClick: () => copyAddress(row),
            },
          ]"
          :dropdown-actions="[
            {
              auth: 'system:externalPage:delete',
              danger: true,
              icon: 'lucide:trash-2',
              text: $t('system.externalPage.delete'),
              popConfirm: {
                title: $t('system.externalPage.deleteConfirm', [row.title]),
                confirm: () => removeRows([row]),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </div>
</template>
