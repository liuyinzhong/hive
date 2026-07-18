import type { VbenFormSchema } from "#/adapter/form";
import type { VxeTableGridOptions } from "#/adapter/vxe-table";
import type { SystemRoleApi } from "#/api";

import { updateRoleStatusApi } from "#/api/system";
import { $t } from "#/locales";

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: "Input",
      fieldName: "roleTitle",
      label: $t("system.role.roleName"),
      rules: "required",
    },
    {
      component: "Input",
      fieldName: "roleId",
      label: "主键id",
      dependencies: {
        triggerFields: ["roleId"],
        show() {
          return false;
        },
      },
    },
    {
      component: "RadioGroup",
      componentProps: {
        buttonStyle: "solid",
        options: [
          { label: $t("common.enabled"), value: 1 },
          { label: $t("common.disabled"), value: 0 },
        ],
        optionType: "button",
      },
      defaultValue: 1,
      fieldName: "status",
      label: $t("system.role.status"),
    },
    {
      component: "Textarea",
      fieldName: "remark",
      label: $t("system.role.remark"),
    },
    {
      component: "Input",
      fieldName: "permissions",
      formItemClass: "items-start",
      label: $t("system.role.setPermissions"),
      modelPropName: "modelValue",
      componentProps: {
        bordered: true,
        autoCheckParent: true,
        selectAllLabel: "全选",
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: "Input",
      fieldName: "roleTitle",
      label: $t("system.role.roleName"),
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
      label: $t("system.role.status"),
    },
    {
      component: "Input",
      fieldName: "remark",
      label: $t("system.role.remark"),
    },
    {
      component: "RangePicker",
      fieldName: "createDate",
      label: $t("system.role.createDate"),
    },
  ];
}

export function useColumns(): VxeTableGridOptions["columns"] {
  return [
    {
      field: "roleTitle",
      title: $t("system.role.roleName"),
      width: 200,
      sortable: true,
      sortBy: "roleTitle",
    },
    {
      field: "roleId",
      title: $t("system.role.id"),
      width: 200,
    },
    {
      cellRender: {
        attrs: {
          onChange: (newStatus: 0 | 1, row: SystemRoleApi.SystemRoleFace) =>
            updateRoleStatusApi(row.roleId, { status: newStatus }),
        },
        name: "CellSwitch",
      },
      field: "status",
      title: $t("system.role.status"),
      width: 100,
    },
    {
      field: "remark",
      minWidth: 100,
      title: $t("system.role.remark"),
    },
    {
      field: "createDate",
      title: $t("system.role.createDate"),
      width: 200,
      sortable: true,
      sortBy: "createDate",
    },
    {
      align: "center",
      field: "operation",
      fixed: "right",
      slots: { default: "action" },
      title: $t("system.role.operation"),
      width: 130,
    },
  ];
}
