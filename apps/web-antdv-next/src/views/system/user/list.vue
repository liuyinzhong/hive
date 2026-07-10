<script lang="ts" setup>
import type { Recordable } from "@vben/types";

import type { VxeTableGridOptions } from "#/adapter/vxe-table";
import type { SystemUserApi, SystemDeptApi } from "#/api/system";

import { nextTick, onMounted, ref, watch } from "vue";

import { Page, Tree, useVbenDrawer } from "@vben/common-ui";
import { Plus } from "@vben/icons";

import { Button, message, Modal, Card } from "antdv-next";

import { useVbenVxeGrid, VbenTableAction } from "#/adapter/vxe-table";
import {
  getUsersListApi,
  deleteUserApi,
  updateUserStatusApi,
  getAllDeptListApi,
} from "#/api/system";
import { $t } from "#/locales";
import { useColumns, useGridFormSchema } from "./data";
import ExtraDrawer from "./drawer.vue";
import Detail from "./detail.vue";

import { formatSorts } from "#/utils";

onMounted(() => {
  loadDeptList();
});
const deptList = ref<SystemDeptApi.SystemDeptFace[]>([]);
const selectedDeptId = ref();
async function loadDeptList() {
  try {
    const res = await getAllDeptListApi();
    deptList.value = res;
  } catch (error) {}
}

async function selectDept(e: any) {
  selectedDeptId.value = e.value.deptId;
  gridApi.query();
}

// #region 表格搜索,配置

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: "sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4",
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(onStatusChange),
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
    },
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts, filters }: any, formValues: any) => {
          return await getUsersListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
            deptId: selectedDeptId.value,
          });
        },
      },
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUserFace>,
  gridEvents: {},
});

// #region 抽屉组件

const [FormDrawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

function onEdit(row: SystemUserApi.SystemUserFace) {
  drawerApi.setData(row).open();
}

function onDetail(row: SystemUserApi.SystemUserFace) {
  detailDrawerApi.setData(row).open();
}

function onCreate() {
  drawerApi.setData({}).open();
}

async function onDelete(row: SystemUserApi.SystemUserFace) {
  const hideLoading = message.loading({
    content: $t("ui.actionMessage.deleting", [row.realName]),
    duration: 0,
    key: "action_process_msg",
  });
  deleteUserApi([row.userId])
    .then(() => {
      message.success({
        content: $t("ui.actionMessage.deleteSuccess", [row.realName]),
        key: "action_process_msg",
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error("已取消"));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(newStatus: number, row: SystemUserApi.SystemUserFace) {
  const status: Recordable<string> = {
    0: "禁用",
    1: "启用",
  };
  try {
    await confirm(
      `你要将${row.realName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateUserStatusApi(row.userId, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

// #endregion

function onRefresh() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer @success="onRefresh" />
    <div class="flex size-full">
      <Card class="w-1/6">
        <Tree
          label-field="deptTitle"
          value-field="deptId"
          :tree-data="deptList"
          :default-expanded-level="2"
          @select="selectDept"
        />
      </Card>

      <div class="w-5/6 ml-4">
        <Grid>
          <template #toolbar-tools>
            <Button type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t("ui.actionTitle.create") }}
            </Button>
          </template>
          <template #action="{ row }">
            <VbenTableAction
              :actions="[
                {
                  text: $t('common.detail'),
                  icon: 'lucide:eye',
                  onClick: () => onDetail(row),
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
                    title: $t('ui.actionMessage.deleteConfirm', [row.realName]),
                    confirm: () => onDelete(row),
                  },
                },
              ]"
              align="center"
            />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
