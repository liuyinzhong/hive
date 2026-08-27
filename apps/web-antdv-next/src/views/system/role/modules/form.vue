<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemMenuApi, SystemRoleApi } from '#/api/system';

import { ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createRoleApi,
  getMenuListApi,
  updateRoleApi,
  getRoleDetailApi,
} from '#/api/system';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<SystemMenuApi.SystemMenuFace[]>([]);
const loadingPermissions = ref(false);

const dataScopes: Set<SystemRoleApi.DataScope> = new Set([
  'all',
  'customDepartment',
  'department',
  'departmentAndChildren',
  'self',
  'none',
]);

function isDataScope(value: unknown): value is SystemRoleApi.DataScope {
  return dataScopes.has(value as SystemRoleApi.DataScope);
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * 递归收集勾选节点及其全部祖先节点 id
 * @description 级联勾选下表单值仅包含全选节点，半选父节点（如菜单下仅勾选部分按钮时的
 * 菜单节点）不在表单值内；提交前按树结构把"自身或后代存在勾选"的节点统一补齐，
 * 保证半选父级菜单 id 进入提交参数
 * @param nodes 菜单树节点集合
 * @param checked 当前勾选的节点 id 集合
 * @param out 输出的 id 集合（勾选节点 + 全部祖先）
 * @returns 当前子树内是否存在勾选节点
 */
function collectWithAncestors(
  nodes: SystemMenuApi.SystemMenuFace[],
  checked: Set<string>,
  out: Set<string>,
): boolean {
  let hit = false;
  for (const node of nodes) {
    const childHit = collectWithAncestors(node.children ?? [], checked, out);
    if (childHit || checked.has(node.id)) {
      out.add(node.id);
      hit = true;
    }
  }
  return hit;
}

/**
 * 组装角色保存请求
 * @param values 表单值
 * @param mergedPermissions 已补齐半选祖先的权限 id 集合
 */
function toSaveRoleRequest(
  values: Recordable<unknown>,
  mergedPermissions: string[],
): SystemRoleApi.SaveRoleRequest {
  const dataScope = isDataScope(values.dataScope) ? values.dataScope : 'self';
  return {
    dataScope,
    dataScopeDeptIds:
      dataScope === 'customDepartment'
        ? toStringArray(values.dataScopeDeptIds)
        : [],
    permissions: mergedPermissions,
    remark: typeof values.remark === 'string' ? values.remark : undefined,
    roleTitle: typeof values.roleTitle === 'string' ? values.roleTitle : '',
    status: values.status === 0 ? 0 : 1,
  };
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const roleId = typeof values.roleId === 'string' ? values.roleId : '';
    // 提交前补齐半选父级：级联勾选下表单值仅含全选节点，
    // 存在勾选子节点的父级菜单（半选态）需按树结构一并提交
    const mergedPermissions = new Set<string>();
    collectWithAncestors(
      permissions.value,
      new Set(toStringArray(values.permissions)),
      mergedPermissions,
    );
    const payload = toSaveRoleRequest(values, [...mergedPermissions]);
    drawerApi.lock();
    try {
      // oxlint-disable-next-line unicorn/prefer-ternary
      if (roleId) {
        await updateRoleApi(roleId, payload);
      } else {
        await createRoleApi(payload);
      }
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      let data: any = drawerApi.getData() || {};
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
        formApi.reset();
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
    const res = await getMenuListApi({ status: 1, hasButton: 1 });
    permissions.value = res;
  } finally {
    loadingPermissions.value = false;
  }
}

function getNodeClass(node: Recordable<any>) {
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
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            class="permission-tree"
            :tree-data="permissions"
            multiple
            bordered
            selectAllLabel="全选"
            :default-expanded-level="0"
            :get-node-class="getNodeClass"
            v-bind="slotProps.componentProps"
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
      </template>
    </Form>
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
