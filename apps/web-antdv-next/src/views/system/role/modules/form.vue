<script lang="ts" setup>
import type { DataNode } from 'antdv-next/dist/tree/index';

import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system';

import { computed, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { createRoleApi, getMenuListApi, updateRoleApi, getRoleDetailApi } from '#/api/system';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (values.roleId ? updateRoleApi(values.roleId, values) : createRoleApi(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {})
      .finally(() => {
        drawerApi.unlock();
      });
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      let data = drawerApi.getData<SystemRoleApi.SystemRoleFace>() || {};
      if (data.roleId) {
        data = await getRoleDetailApi(data.roleId);
        formApi.setValues(data);
        drawerApi.setState({
          title: $t('ui.actionTitle.edit', [$t('system.role.name')]),
        });
      } else {
        drawerApi.setState({
          title: $t('ui.actionTitle.create', [$t('system.role.name')]),
        });
        formApi.resetForm();
      }

      if (permissions.value.length === 0) {
        loadPermissions();
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getMenuListApi();
    permissions.value = res as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
    if (node.index % 3 >= 1) {
      classes.push('!pl-0');
    }
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer class="w-[800px]">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </Tree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
