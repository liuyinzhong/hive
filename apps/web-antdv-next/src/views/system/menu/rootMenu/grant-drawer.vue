<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuApi, SystemRoleApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { TabPane, Tabs } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMenuGrantedRolesApi, getMenuGrantedUsersApi } from '#/api/system';
import { $t } from '#/locales';
import { dataScopeLabel } from '../../role/data';

defineOptions({ name: 'MenuGrantDrawer' });

type GrantTab = 'deny' | 'grant' | 'roles';

const menuId = ref('');
const menuTitle = ref('');
const activeTab = ref<GrantTab>('roles');

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data: any = drawerApi.getData() || {};
    menuId.value = typeof data.id === 'string' ? data.id : '';
    menuTitle.value = data?.meta?.title ? $t(data.meta.title) : '';
    drawerApi.setState({
      title: $t('system.menu.grantTitle', [menuTitle.value]),
    });
    activeTab.value = 'roles';
    rolesGridApi.query();
  },
});

const [RolesGrid, rolesGridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useRoleColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async () => {
          if (!menuId.value) {
            return [];
          }
          // pagerConfig 禁用时 vxe 按 list:''（响应本身为数组）解析，不能包装成 { items, total }
          return (await getMenuGrantedRolesApi(menuId.value)) ?? [];
        },
      },
    },
    rowConfig: {
      keyField: 'roleId',
    },
    toolbarConfig: {
      custom: false,
      refresh: true,
      zoom: false,
    },
  } as VxeTableGridOptions<SystemMenuApi.MenuGrantedRoleItem>,
});

const [UsersGrid, usersGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        componentProps: { allowClear: true },
        fieldName: 'keyword',
        label: $t('system.role.keyword'),
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { label: $t('common.enabled'), value: 1 },
            { label: $t('common.disabled'), value: 0 },
          ],
        },
        fieldName: 'status',
        label: $t('system.user.status'),
      },
    ],
    submitOnChange: true,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridOptions: {
    columns: useUserColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          if (!menuId.value || activeTab.value === 'roles') {
            return { items: [], total: 0 };
          }
          return await getMenuGrantedUsersApi(menuId.value, {
            grantType: activeTab.value,
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'userId',
    },
    toolbarConfig: {
      custom: false,
      refresh: true,
      zoom: false,
    },
  } as VxeTableGridOptions<SystemMenuApi.MenuGrantedUserItem>,
});

function onTabChange(tab: string | number) {
  activeTab.value = tab as GrantTab;
  if (tab === 'roles') {
    rolesGridApi.query();
  } else {
    usersGridApi.query();
  }
}

function useRoleColumns(): VxeTableGridOptions<SystemMenuApi.MenuGrantedRoleItem>['columns'] {
  return [
    { field: 'roleTitle', title: $t('system.role.name'), minWidth: 140 },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.role.status'),
      width: 90,
    },
    {
      field: 'dataScope',
      formatter: ({ row }) =>
        dataScopeLabel(row.dataScope as SystemRoleApi.DataScope),
      title: $t('system.role.dataScope'),
      width: 150,
    },
    {
      field: 'remark',
      formatter: ({ row }) => row.remark ?? '',
      title: $t('system.user.remark'),
      minWidth: 120,
    },
    { field: 'grantDate', title: $t('system.menu.grantDate'), width: 160 },
  ];
}

function useUserColumns(): VxeTableGridOptions<SystemMenuApi.MenuGrantedUserItem>['columns'] {
  return [
    { field: 'username', title: $t('system.user.username'), minWidth: 120 },
    { field: 'realName', title: $t('system.user.realName'), minWidth: 120 },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.user.status'),
      width: 90,
    },
    {
      field: 'deptTitles',
      formatter: ({ row }) => row.deptTitles.join('、'),
      title: $t('system.user.dept'),
      minWidth: 150,
    },
    { field: 'grantDate', title: $t('system.menu.grantDate'), width: 160 },
  ];
}
</script>

<template>
  <Drawer class="w-[960px]">
    <div class="flex h-full flex-col">
      <Tabs
        :active-key="activeTab"
        class="flex-none"
        @change="onTabChange"
      >
        <TabPane key="roles" :tab="$t('system.menu.grantRoles')" />
        <TabPane key="grant" :tab="$t('system.menu.grantUsers')" />
        <TabPane key="deny" :tab="$t('system.menu.denyUsers')" />
      </Tabs>
      <div class="min-h-0 flex-1">
        <div v-show="activeTab === 'roles'" class="h-full">
          <RolesGrid />
        </div>
        <div v-show="activeTab !== 'roles'" class="h-full">
          <UsersGrid />
        </div>
      </div>
    </div>
  </Drawer>
</template>
