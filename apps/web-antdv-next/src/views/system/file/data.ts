import type { VbenFormSchema } from "#/adapter/form";
import type { VxeTableGridOptions } from "#/adapter/vxe-table";

import { $t } from "#/locales";

/**
 * 将字节数格式化为可读的文件大小字符串
 * @param bytes 字节数
 * @returns 格式化后的字符串（如 1.5 MB）
 */
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${units[i]}`;
}

/**
 * 搜索表单配置
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: "Input",
      fieldName: "originalName",
      label: $t("system.file.fileName"),
      componentProps: {
        placeholder: $t("system.file.searchFileName"),
        allowClear: true,
      },
    },
    {
      component: "Input",
      fieldName: "type",
      label: $t("system.file.mimeType"),
      componentProps: {
        placeholder: $t("system.file.searchMimeType"),
        allowClear: true,
      },
    },
    {
      component: "Input",
      fieldName: "fileExt",
      label: $t("system.file.fileExt"),
      componentProps: {
        placeholder: $t("system.file.searchFileExt"),
        allowClear: true,
      },
    },
  ];
}

/**
 * 表格列配置
 */
export function useColumns(): VxeTableGridOptions["columns"] {
  return [
    {
      field: "url",
      title: $t("system.file.imagePreview"),
      width: 90,
      align: "center",
      cellRender: { name: "CellImage" },
    },
    {
      field: "originalName",
      title: $t("system.file.fileName"),
      minWidth: 200,
      sortable: true,
      sortBy: "originalName",
    },
    {
      field: "fileExt",
      title: $t("system.file.fileExt"),
      width: 100,
      sortable: true,
      sortBy: "fileExt",
    },
    {
      field: "type",
      title: $t("system.file.mimeType"),
      width: 160,
      sortable: true,
      sortBy: "type",
    },
    {
      field: "size",
      title: $t("system.file.fileSize"),
      width: 120,
      sortable: true,
      sortBy: "size",
      formatter: ({ row }: any) => formatFileSize(row.size),
    },
    {
      field: "fullPath",
      title: $t("system.file.fullPath"),
      minWidth: 200,
    },
    {
      field: "creatorName",
      title: $t("system.file.uploader"),
      width: 120,
      sortable: true,
      sortBy: "creatorName",
    },
    {
      field: "createDate",
      title: $t("system.file.uploadTime"),
      width: 180,
      sortable: true,
      sortBy: "createDate",
    },
    {
      align: "center",
      field: "operation",
      fixed: "right",
      slots: { default: "action" },
      title: $t("system.file.operation"),
      width: 150,
    },
  ];
}
