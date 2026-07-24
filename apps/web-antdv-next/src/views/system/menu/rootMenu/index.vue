<script lang="ts" setup>
import type { VxeTableGridOptions } from "#/adapter/vxe-table";

import { watchEffect } from "vue";

import { Page, useVbenDrawer } from "@vben/common-ui";
import { IconifyIcon, Plus } from "@vben/icons";
import { $t } from "@vben/locales";

import { MenuBadge } from "@vben-core/menu-ui";

import { Button, message } from "antdv-next";

import { useVbenVxeGrid, VbenTableAction } from "#/adapter/vxe-table";
import { deleteMenuApi, getMenuListApi, SystemMenuApi } from "#/api/system";

import { useColumns } from "./data";
import Form from "./form.vue";

watchEffect(() => {});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: "auto",
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params: any) => {
          return await getMenuListApi({ status: null, hasButton: 1 });
        },
      },
    },
    rowConfig: {
      keyField: "id",
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: "pid",
      rowField: "id",
      transform: false,
    },
  } as VxeTableGridOptions,
});

function onRefresh() {
  gridApi.query();
}
function onEdit(row: SystemMenuApi.SystemMenuFace) {
  formDrawerApi.setData(row).open();
}
function onCreate() {
  formDrawerApi.setData({}).open();
}
function onAppend(row: SystemMenuApi.SystemMenuFace) {
  formDrawerApi.setData({ pid: row.id }).open();
}

function onDelete(row: SystemMenuApi.SystemMenuFace) {
  const hideLoading = message.loading({
    content: $t("ui.actionMessage.deleting", [
      row.name ?? (row.meta?.title ? $t(row.meta.title) : row.id),
    ]),
    duration: 0,
    key: "action_process_msg",
  });
  deleteMenuApi([row.id])
    .then(() => {
      message.success({
        content: $t("ui.actionMessage.deleteSuccess", [row.meta?.title]),
        key: "action_process_msg",
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}
</script>
<template>
  <div class="h-[calc(100%_-_30px)]">
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '新增下级',
              onClick: () => onAppend(row),
            },
            {
              text: '编辑',
              icon: 'lucide:edit',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [$t(row.meta.title)]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t("ui.actionTitle.create", [$t("system.menu.name")]) }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
            <IconifyIcon v-if="row.type === 'button'" icon="carbon:security" class="size-full" />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta?.title) }}</span>
          <!-- <span class="flex-auto">{{ row.meta?.title }}</span> -->
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>
  </div>
</template>
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
