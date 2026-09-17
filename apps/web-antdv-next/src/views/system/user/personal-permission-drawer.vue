<script lang="ts" setup>
import type { DataNode } from 'antdv-next/dist/tree/index';

import { ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Alert, Spin, TabPane, Tabs } from 'antdv-next';

import {
  getUserPersonalPermissionsApi,
  saveUserPersonalPermissionsApi,
} from '#/api/system';
import { $t } from '#/locales';

defineOptions({ name: 'UserPersonalPermissionDrawer' });

const emits = defineEmits(['success']);

const permissions = ref<DataNode[]>([]);
const loading = ref(false);
const grantValue = ref<string[]>([]);
const denyValue = ref<string[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const data: any = drawerApi.getData() || {};
    if (!data.userId) return;
    drawerApi.lock();
    try {
      await saveUserPersonalPermissionsApi(data.userId, {
        grantMenuIds: grantValue.value,
        denyMenuIds: denyValue.value,
      });
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data: any = drawerApi.getData() || {};
    drawerApi.setState({
      title: $t('system.user.personalPermissionTitle', [data.realName ?? '']),
    });
    await loadPersonal(data.userId);
  },
});

async function loadPersonal(userId: string) {
  if (!userId) return;
  loading.value = true;
  try {
    // 回显集合与可勾选菜单树一次请求返回，不依赖菜单管理列表权限
    const res = await getUserPersonalPermissionsApi(userId);
    grantValue.value = res.grantMenuIds ?? [];
    denyValue.value = res.denyMenuIds ?? [];
    permissions.value = (res.menuTree ?? []) as unknown as DataNode[];
  } finally {
    loading.value = false;
  }
}

function getNodeClass(node: any) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('permission-button-node');
    if (node.index % 3 === 0) {
      classes.push('permission-button-node--row-start');
    }
  }
  return classes.join(' ');
}
</script>

<template>
  <Drawer class="w-[800px]">
    <div class="flex flex-col gap-3">
      <Alert
        :message="$t('system.user.personalPermissionScopeTip')"
        type="info"
        show-icon
      />
      <Tabs>
        <TabPane key="grant" :tab="$t('system.user.personalGrant')">
          <Spin :spinning="loading" wrapper-class-name="w-full">
            <Tree
              v-model="grantValue"
              class="permission-tree"
              :tree-data="permissions"
              multiple
              bordered
              selectAllLabel="全选"
              :include-indeterminate="true"
              :default-expanded-level="0"
              :get-node-class="getNodeClass"
              value-field="id"
              label-field="meta.title"
              icon-field="meta.icon"
            >
              <template #node="{ value }">
                <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
                <IconifyIcon
                  v-if="value.type == 'button'"
                  icon="carbon:security"
                />
                {{ $t(value.meta.title) }}
              </template>
            </Tree>
          </Spin>
        </TabPane>
        <TabPane key="deny" :tab="$t('system.user.personalDeny')">
          <Spin :spinning="loading" wrapper-class-name="w-full">
            <Tree
              v-model="denyValue"
              class="permission-tree"
              :tree-data="permissions"
              multiple
              bordered
              selectAllLabel="全选"
              :include-indeterminate="true"
              :default-expanded-level="0"
              :get-node-class="getNodeClass"
              value-field="id"
              label-field="meta.title"
              icon-field="meta.icon"
            >
              <template #node="{ value }">
                <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
                <IconifyIcon
                  v-if="value.type == 'button'"
                  icon="carbon:security"
                />
                {{ $t(value.meta.title) }}
              </template>
            </Tree>
          </Spin>
        </TabPane>
      </Tabs>
    </div>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.permission-tree) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

:deep(.permission-tree > :not(.permission-button-node)) {
  grid-column: 1 / -1;
}

:deep(.permission-button-node) {
  min-width: 0;
  margin-left: 0 !important;
}

:deep(.permission-button-node--row-start) {
  padding-left: 2rem;
}

:deep(.permission-button-node .item-checkbox) {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
