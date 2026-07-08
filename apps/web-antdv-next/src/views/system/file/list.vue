<script lang="ts" setup>
import type { Recordable } from "@vben/types";

import type { SystemFileApi } from "#/api";

import { nextTick } from "vue";

import { Page } from "@vben/common-ui";
import { Plus } from "@vben/icons";

import { Button, Image, message, Upload } from "antdv-next";

import { useVbenVxeGrid, VbenTableAction } from "#/adapter/vxe-table";
import { getFileListApi, uploadFileApi } from "#/api/system";
import { $t } from "#/locales";
import { formatSorts } from "#/utils";
import { useClipboard } from "@vueuse/core";
import { useColumns, useGridFormSchema } from "./data";
const { copy } = useClipboard({ legacy: true });

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: "sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",
    schema: useGridFormSchema(),
    submitOnEnter: true,
  },
  gridOptions: {
    columns: useColumns(),
    height: "auto",
    keepSource: true,
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }: any, formValues: Recordable<any>) => {
          return await getFileListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: "fileId",
    },
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
    },
  } as any,
});

/**
 * 刷新列表
 */
function onRefresh() {
  gridApi.query();
}

/**
 * 处理文件上传
 * @param options antdv Upload 组件的 customRequest 回调参数
 */
async function handleUpload(options: any) {
  try {
    await uploadFileApi({ file: options.file });
    options.onSuccess();
    message.success($t("system.file.uploadSuccess"));
    onRefresh();
  } catch {
    options.onError(new Error("上传失败"));
  }
}

/**
 * 预览文件（新窗口打开）
 * @param row 行数据
 */
function onPreview(row: SystemFileApi.SystemFileFace) {
  window.open(row.url, "_blank");
}

/**
 * 复制文件链接
 * @param row 行数据
 */
function onCopyUrl(row: SystemFileApi.SystemFileFace) {
  copy(row.url);
  message.success($t("system.file.copyLinkSuccess"));
}

/**
 * 判断文件是否为图片类型
 * @param type MIME类型
 * @returns 是否为图片
 */
function isImageType(type: string): boolean {
  return type?.startsWith("image/");
}
</script>
<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: $t('system.file.preview'),
              icon: 'lucide:eye',
              onClick: () => onPreview(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: $t('system.file.copyLink'),
              icon: 'lucide:copy',
              onClick: () => onCopyUrl(row),
            },
          ]"
          align="center"
        />
      </template>
      <template #toolbar-tools>
        <Upload :custom-request="handleUpload" :show-upload-list="false" accept="*">
          <Button type="primary">
            <Plus class="size-5" />
            {{ $t("system.file.upload") }}
          </Button>
        </Upload>
      </template>
    </Grid>
  </Page>
</template>
