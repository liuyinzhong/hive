import type { VbenFormSchema } from "#/adapter/form";
import type { VxeTableGridOptions } from "#/adapter/vxe-table";
import type { ExternalPageApi } from "#/api/system";

import { updateExternalPageStatusApi } from "#/api/system";

import { $t } from "#/locales";

export function useExternalPageSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: "Input",
      fieldName: "title",
      label: $t("system.externalPage.title"),
    },
    {
      component: "Input",
      fieldName: "path",
      label: $t("system.externalPage.path"),
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: [
          { label: $t("common.enabled"), value: 1 },
          { label: $t("common.disabled"), value: 0 },
        ],
      },
      fieldName: "status",
      label: $t("system.externalPage.status"),
    },
  ];
}

export function useExternalPageColumns(): VxeTableGridOptions<ExternalPageApi.ExternalPage>["columns"] {
  return [
    { type: "checkbox", width: 35, fixed: "left", align: "center" },
    {
      field: "title",
      fixed: "left",
      minWidth: 180,
      slots: { default: "title" },
      title: $t("system.externalPage.title"),
    },
    {
      field: "name",
      minWidth: 150,
      title: $t("system.externalPage.routeName"),
    },
    {
      field: "path",
      minWidth: 220,
      title: $t("system.externalPage.path"),
    },
    {
      cellRender: {
        attrs: {
          auth: "system:externalPage:status",
          onChange: (status: 0 | 1, row: ExternalPageApi.ExternalPage) =>
            updateExternalPageStatusApi(row.id, status),
        },
        name: "CellSwitch",
      },
      field: "status",
      title: $t("system.externalPage.status"),
      width: 100,
    },

    {
      field: "creatorName",
      minWidth: 120,
      title: $t("system.externalPage.creatorName"),
    },
    {
      field: "createDate",
      minWidth: 170,
      title: $t("system.externalPage.createDate"),
    },
    {
      field: "updateDate",
      minWidth: 170,
      title: $t("system.externalPage.updateDate"),
    },
    {
      align: "center",
      field: "operation",
      fixed: "right",
      showOverflow: false,
      slots: { default: "action" },
      title: $t("system.externalPage.operation"),
      width: 200,
    },
  ];
}
