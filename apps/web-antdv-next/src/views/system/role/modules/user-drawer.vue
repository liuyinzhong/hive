<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getRoleUsersApi, removeRoleUsersApi } from '#/api/system';
import { $t } from '#/locales';

import { useRoleUserColumns } from '../data';
import RoleUserSelectModal from './user-select-modal.vue';

defineOptions({
  name: 'RoleUserDrawer',
});

const emits = defineEmits<{
  change: [];
}>();

const roleId = ref('');
const roleTitle = ref('');

const [UserSelectModal, userSelectModalApi] = useVbenModal({
  connectedComponent: RoleUserSelectModal,
  destroyOnClose: true,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (isOpen) {
      const data: any = drawerApi.getData() || {};
      roleId.value = typeof data.roleId === 'string' ? data.roleId : '';
      roleTitle.value =
        typeof data.roleTitle === 'string' ? data.roleTitle : '';
      drawerApi.setState({
        title: $t('system.role.userTitle', [roleTitle.value]),
      });
      gridApi.query();
    }
  },
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        componentProps: { allowClear: true },
        fieldName: 'keyword',
        label: $t('system.role.keyword'),
      },
    ],
    submitOnChange: true,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridOptions: {
    columns: useRoleUserColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          if (!roleId.value) {
            return { items: [], total: 0 };
          }
          return await getRoleUsersApi(roleId.value, {
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
  } as VxeTableGridOptions<SystemRoleApi.RoleUserItem>,
});

function getLoadedUserIds(): string[] {
  const tableData = gridApi.grid?.getTableData?.().fullData ?? [];
  return tableData
    .map((row) => row.userId)
    .filter((userId): userId is string => typeof userId === 'string');
}

function onChanged() {
  emits('change');
  gridApi.query();
}

function onAdd() {
  userSelectModalApi
    .setData({
      excludeUserIds: getLoadedUserIds(),
      roleId: roleId.value,
    })
    .open();
}

function onRemove(row: SystemRoleApi.RoleUserItem) {
  const hideLoading = message.loading({
    content: $t('system.role.removing', [row.realName]),
    duration: 0,
    key: 'action_process_msg',
  });
  removeRoleUsersApi(roleId.value, [row.userId])
    .then((result) => {
      message.success({
        content: $t('system.role.removeUserSuccess', [result.count]),
        key: 'action_process_msg',
      });
      onChanged();
    })
    .catch(() => {
      hideLoading();
    });
}
</script>
<template>
  <Drawer class="w-[960px]">
    <UserSelectModal @success="onChanged" />
    <Grid>
      <template #toolbar-tools>
        <Button
          v-access:code="['system:role:user']"
          type="primary"
          @click="onAdd"
        >
          {{ $t('system.role.addUser') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: $t('system.role.removeUser'),
              icon: 'lucide:user-minus',
              danger: true,
              auth: ['system:role:user'],
              popConfirm: {
                title: $t('system.role.removeUserConfirm', [row.realName]),
                confirm: () => onRemove(row),
              },
            },
          ]"
          :dropdown-actions="[]"
          align="center"
        />
      </template>
    </Grid>
  </Drawer>
</template>
