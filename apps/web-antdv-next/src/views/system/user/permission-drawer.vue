<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi, SystemUserApi } from '#/api/system';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Input, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserPermissionsApi } from '#/api/system';
import { $t } from '#/locales';
import { getMenuTypeOptions } from '../menu/rootMenu/data';
import { dataScopeLabel } from '../role/data';

defineOptions({ name: 'UserPermissionDrawer' });

/**
 * 权限明细树行：分组父行（角色 / 个人权限，isRole 或 isPersonal）与菜单节点行共用一套列；
 * 菜单节点行按菜单树层级嵌套（目录→页面→按钮），层级由树缩进表达
 */
interface PermissionRow {
  authCode?: null | string;
  children?: PermissionRow[];
  count?: number;
  dataScope?: SystemRoleApi.DataScope;
  /** 个人禁止分组，合并时绝对优先 */
  denyGroup?: boolean;
  isPersonal?: boolean;
  isRole?: boolean;
  menuId?: string;
  path?: null | string;
  roleStatus?: 0 | 1;
  roleTitle?: string;
  rowKey: string;
  status?: 0 | 1;
  title?: string;
  type?: 'button' | 'catalog' | 'embedded' | 'link' | 'menu';
}

const keyword = ref('');
const fullTree = ref<PermissionRow[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data: any = drawerApi.getData() || {};
    drawerApi.setState({
      title: $t('system.user.permissionTitle', [data.realName ?? '']),
    });
    await loadPermissions(data.userId);
  },
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    rowConfig: {
      isHover: true,
      keyField: 'rowKey',
    },
    showOverflow: true,
    toolbarConfig: {
      custom: true,
      refresh: false,
      zoom: true,
    },
    treeConfig: {
      children: 'children',
      rowField: 'rowKey',
    },
  } as VxeTableGridOptions<PermissionRow>,
});

async function loadPermissions(userId: string) {
  if (!userId) return;
  gridApi.setLoading(true);
  try {
    const result = await getUserPermissionsApi(userId);
    fullTree.value = buildTree(result);
    keyword.value = '';
    await applyTree(fullTree.value, false);
  } finally {
    gridApi.setLoading(false);
  }
}

function buildTree(result: SystemUserApi.UserPermissionResult): PermissionRow[] {
  const rows: PermissionRow[] = [];

  const personal = result.personal;
  if (personal && (personal.grantCount > 0 || personal.denyCount > 0)) {
    if (personal.grantCount > 0) {
      rows.push({
        children: toMenuRows(personal.grant, 'personal-grant'),
        count: personal.grantCount,
        isPersonal: true,
        rowKey: 'personal-grant',
        title: $t('system.user.personalGrant'),
      });
    }
    if (personal.denyCount > 0) {
      rows.push({
        children: toMenuRows(personal.deny, 'personal-deny'),
        count: personal.denyCount,
        denyGroup: true,
        isPersonal: true,
        rowKey: 'personal-deny',
        title: $t('system.user.personalDeny'),
      });
    }
  }

  rows.push(
    ...result.roles.map((role) => ({
      children: toMenuRows(role.permissions, role.roleId),
      count: role.permissionCount,
      dataScope: role.dataScope,
      isRole: true as const,
      roleStatus: role.status,
      roleTitle: role.roleTitle,
      rowKey: `role-${role.roleId}`,
    })),
  );
  return rows;
}

function toMenuRows(
  items: SystemUserApi.UserPermissionItem[],
  roleId: string,
): PermissionRow[] {
  return items.map((item) => ({
    authCode: item.authCode,
    children: item.children ? toMenuRows(item.children, roleId) : undefined,
    isRole: false,
    menuId: item.menuId,
    path: item.path,
    rowKey: `${roleId}-${item.menuId}`,
    status: item.status,
    title: item.title,
    type: item.type,
  }));
}

async function applyTree(rows: PermissionRow[], expand: boolean) {
  await gridApi.grid?.loadData?.(rows);
  if (expand) {
    gridApi.grid?.setAllTreeExpand?.(true);
  }
}

/** 按角色名或权限名称/路由路径/权限码过滤；节点自身命中或存在命中后代时保留，命中分组自动展开 */
function onSearch() {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) {
    applyTree(fullTree.value, false);
    return;
  }

  const filtered = fullTree.value
    .map((group) => {
      const groupLabel = (group.roleTitle ?? group.title ?? '').toLowerCase();
      if (groupLabel.includes(kw)) return group;
      const children = filterMenuRows(group.children ?? [], kw);
      if (children.length === 0) return undefined;
      return { ...group, children };
    })
    .filter((group): group is PermissionRow => group !== undefined);
  applyTree(filtered, true);
}

function filterMenuRows(rows: PermissionRow[], kw: string): PermissionRow[] {
  const result: PermissionRow[] = [];
  for (const row of rows) {
    const children = filterMenuRows(row.children ?? [], kw);
    if (children.length > 0 || matchRow(row, kw)) {
      result.push({ ...row, children });
    }
  }
  return result;
}

function matchRow(row: PermissionRow, kw: string) {
  const name = $t(row.title ?? '').toLowerCase();
  const path = (row.path ?? '').toLowerCase();
  const code = (row.authCode ?? '').toLowerCase();
  const typeLabel = (findTypeOption(row.type)?.label ?? '').toLowerCase();
  return (
    name.includes(kw) ||
    path.includes(kw) ||
    code.includes(kw) ||
    typeLabel.includes(kw)
  );
}

function findTypeOption(type?: string) {
  return getMenuTypeOptions().find((item) => item.value === type);
}

function roleDataScopeLabel(row: PermissionRow) {
  return row.dataScope ? dataScopeLabel(row.dataScope) : '';
}

function useColumns(): VxeTableGridOptions<PermissionRow>['columns'] {
  return [
    {
      field: 'title',
      slots: { default: 'title' },
      title: $t('system.user.permissionName'),
      treeNode: true,
      minWidth: 280,
    },
    {
      field: 'type',
      slots: { default: 'type' },
      title: $t('system.menu.type'),
      width: 100,
    },
    {
      field: 'path',
      formatter: ({ row }) =>
        row.isRole || row.isPersonal ? '' : row.path ?? '',
      title: $t('system.menu.path'),
      minWidth: 180,
    },
    {
      field: 'authCode',
      formatter: ({ row }) =>
        row.isRole || row.isPersonal ? '' : row.authCode ?? '',
      title: $t('system.menu.authCode'),
      width: 200,
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('system.user.status'),
      width: 90,
    },
  ];
}
</script>

<template>
  <Drawer class="w-[960px]">
    <div class="flex h-full flex-col gap-2">
      <Input
        v-model:value="keyword"
        :placeholder="$t('system.user.permissionSearch')"
        allow-clear
        class="flex-none"
        @change="onSearch"
      />
      <div class="min-h-0 flex-1">
        <Grid>
          <template #title="{ row }">
            <div v-if="row.isRole" class="flex flex-wrap items-center gap-2">
              <span class="font-medium">{{ row.roleTitle }}</span>
              <Tag :color="row.roleStatus === 1 ? 'success' : 'error'">
                {{
                  row.roleStatus === 1
                    ? $t('common.enabled')
                    : $t('common.disabled')
                }}
              </Tag>
              <Tag>{{ roleDataScopeLabel(row) }}</Tag>
              <span class="text-muted-foreground text-xs">
                {{ $t('system.user.permissionCount', [row.count]) }}
              </span>
            </div>
            <div
              v-else-if="row.isPersonal"
              class="flex flex-wrap items-center gap-2"
            >
              <span class="font-medium" :class="{ 'text-destructive': row.denyGroup }">
                {{ row.title }}
              </span>
              <Tag v-if="row.denyGroup" color="error">
                {{ $t('system.user.personalDenyPriority') }}
              </Tag>
              <span class="text-muted-foreground text-xs">
                {{ $t('system.user.permissionCount', [row.count]) }}
              </span>
            </div>
            <span v-else>{{ $t(row.title ?? '') }}</span>
          </template>
          <template #type="{ row }">
            <Tag
              v-if="!row.isRole && !row.isPersonal"
              :color="findTypeOption(row.type)?.color"
            >
              {{ findTypeOption(row.type)?.label ?? row.type }}
            </Tag>
          </template>
          <template #status="{ row }">
            <Tag
              v-if="!row.isRole && !row.isPersonal"
              :color="row.status === 1 ? 'success' : 'error'"
            >
              {{
                row.status === 1
                  ? $t('common.enabled')
                  : $t('common.disabled')
              }}
            </Tag>
          </template>
          <template #empty>
            <div class="py-6">{{ $t('system.user.noRole') }}</div>
          </template>
        </Grid>
      </div>
    </div>
  </Drawer>
</template>
