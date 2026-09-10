<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addRoleUsersApi, getUsersListApi } from '#/api/system';
import { $t } from '#/locales';

import { useRoleUserSelectColumns } from '../data';

defineOptions({
  name: 'RoleUserSelectModal',
});

const emits = defineEmits<{
  success: [];
}>();

const roleId = ref('');
const excludedUserIds = ref<Set<string>>(new Set());

const [SelectGrid, selectGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        componentProps: { allowClear: true },
        fieldName: 'username',
        label: $t('system.user.username'),
      },
      {
        component: 'Input',
        componentProps: { allowClear: true },
        fieldName: 'realName',
        label: $t('system.user.realName'),
      },
    ],
    submitOnEnter: true,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridOptions: {
    checkboxConfig: {
      checkMethod: ({ row }) => !excludedUserIds.value.has(row.userId),
      reserve: true,
    },
    columns: useRoleUserSelectColumns(),
    height: 520,
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          if (!roleId.value) {
            return { items: [], total: 0 };
          }
          return await getUsersListApi({
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
  } as VxeTableGridOptions<SystemUserApi.SystemUserFace>,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const records = selectGridApi.grid?.getCheckboxRecords?.(true) ?? [];
    const userIds = records
      .map((row) => row.userId)
      .filter((userId): userId is string => typeof userId === 'string');
    if (userIds.length === 0) {
      message.warning($t('system.role.addUserEmpty'));
      return;
    }
    modalApi.lock();
    try {
      const result = await addRoleUsersApi(roleId.value, userIds);
      message.success($t('system.role.addUserSuccess', [result.count]));
      modalApi.close();
      emits('success');
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data: any = modalApi.getData() || {};
      roleId.value = typeof data.roleId === 'string' ? data.roleId : '';
      excludedUserIds.value = new Set(
        Array.isArray(data.excludeUserIds) ? data.excludeUserIds : [],
      );
      selectGridApi.query();
    }
  },
});
</script>
<template>
  <Modal class="w-[750px]" :title="$t('system.role.addUser')">
    <SelectGrid />
  </Modal>
</template>
