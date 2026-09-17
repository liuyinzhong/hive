<script lang="ts" setup>
import type { DataNode } from 'antdv-next/dist/tree/index';

import { ref } from 'vue';

import { Tree, useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { useAccess } from '@vben/access';
import { IconifyIcon } from '@vben/icons';

import { Alert, Spin, TabPane, Tabs } from 'antdv-next';

import {
  createUserApi,
  getPersonalPermissionMenuTreeApi,
  getUserDetailApi,
  updateUserApi,
} from '#/api/system';
import { $t } from '#/locales';
import { useFormSchema } from './data';

defineOptions({
  name: 'UserEditDrawer',
});
const emit = defineEmits<{
  success: [];
}>();

// 个人权限维护权限码控制权限区展示与提交，无权限码时不渲染也不提交
const { hasAccessByCodes } = useAccess();
const canEditPersonalPermission = hasAccessByCodes([
  'system:user:personalPermission',
]);

const permissions = ref<DataNode[]>([]);
const permissionLoading = ref(false);
const grantValue = ref<string[]>([]);
const denyValue = ref<string[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  title: '添加用户',
  onConfirm: async () => {
    const { valid } = await formApi.validate();
    if (valid) {
      const data = await formApi.getValues();
      // 有个人权限维护权限时随保存提交两个集合（完整替换语义），与基础信息一次请求完成
      if (canEditPersonalPermission) {
        data.grantMenuIds = grantValue.value;
        data.denyMenuIds = denyValue.value;
      }
      drawerApi.lock();
      (data.userId ? updateUserApi(data.userId, data) : createUserApi(data))
        .then(() => {
          drawerApi.close();
          emit('success');
        })
        .catch(() => {})
        .finally(() => {
          drawerApi.unlock();
        });
    }
  },
  onOpenChange: async (isOpen: boolean) => {
    if (!isOpen) return;
    const data: any = drawerApi.getData() || {};
    if (data.userId) {
      drawerApi.setState({ title: '修改用户' });
    }
    // 权限区复位：新建初始为空集合，编辑回显目标用户当前集合
    grantValue.value = [];
    denyValue.value = [];
    permissionLoading.value = true;
    const tasks: Promise<void>[] = [];
    if (canEditPersonalPermission) {
      tasks.push(loadPersonalPermissionMenuTree());
    }
    if (data.userId) {
      tasks.push(loadUserDetail(data.userId));
    } else {
      formApi.setValues(data);
    }
    try {
      await Promise.all(tasks);
    } catch {
      // 加载失败时保持抽屉打开，错误提示由请求层全局拦截器统一弹出
    } finally {
      permissionLoading.value = false;
    }
  },
});

/** 加载可授权菜单树：新建与编辑共用唯一树来源 */
async function loadPersonalPermissionMenuTree() {
  const res = await getPersonalPermissionMenuTreeApi();
  permissions.value = (res.menuTree ?? []) as unknown as DataNode[];
}

/** 编辑模式：详情接口一次返回基础信息与个人权限两个集合并回显 */
async function loadUserDetail(userId: string) {
  const res = await getUserDetailApi(userId);
  formApi.setValues(res);
  grantValue.value = res.grantMenuIds ?? [];
  denyValue.value = res.denyMenuIds ?? [];
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  schema: useFormSchema(),
});

/** 按钮节点换行排布的样式类：与权限明细抽屉一致的树节点展示 */
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
      <Form />
      <template v-if="canEditPersonalPermission">
        <Alert
          :message="$t('system.user.personalPermissionScopeTip')"
          type="info"
          show-icon
        />
        <Tabs>
          <TabPane
            key="grant"
            :tab="`${$t('system.user.personalGrant')} (${grantValue.length})`"
          >
            <Spin :spinning="permissionLoading" wrapper-class-name="w-full">
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
          <TabPane
            key="deny"
            :tab="`${$t('system.user.personalDeny')} (${denyValue.length})`"
          >
            <Spin :spinning="permissionLoading" wrapper-class-name="w-full">
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
      </template>
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
