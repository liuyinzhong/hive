import type { VxeTableGridOptions } from "@vben/plugins/vxe-table";

import type { VbenFormSchema } from "#/adapter/form";
import type { SystemUserApi } from "#/api/system";
import type { DescriptionsItemType } from "@vben/common-ui";
import { Tag } from "antdv-next";

import { h } from "vue";

import { Flex } from "antdv-next";

import { z } from "#/adapter/form";
import { getAllDeptListApi, getAllRoleListApi } from "#/api/system";
import { $t } from "#/locales";
/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: "Input",
      label: "用户表主键id",
      fieldName: "userId",
      rules: "required",
      dependencies: {
        triggerFields: ["userId"],
        show: false,
      },
    },
    {
      component: "Input",
      fieldName: "username",
      label: "登录名",
      rules: z
        .string()
        .min(1, { message: "请输入登录名" })
        .regex(/^[A-Za-z]+$/, { message: "登录名只能输入英文字母" })
        .refine((value) => value.toLowerCase() !== "superadmin", {
          message: "登录名不能为 superAdmin",
        }),
    },
    {
      component: "Input",
      fieldName: "realName",
      label: "真实姓名",
      rules: "required",
    },
    {
      component: "Input",
      fieldName: "phone",
      label: "手机号",
      componentProps: {
        maxlength: 11,
      },
      rules: z
        .string()
        .length(11, $t("ui.formRules.length", ["手机号", 11]))
        .regex(/^\d{11}$/, "手机号格式不正确"),
    },
    {
      component: "InputPassword",
      fieldName: "password",
      label: "密码",
      rules: "required",
      dependencies: {
        triggerFields: ["userId"],
        if: (values) => !values.userId,
      },
    },
    {
      component: "Textarea",
      fieldName: "desc",
      label: "描述",
    },
    {
      component: "ApiTreeSelect",
      fieldName: "deptIds",
      label: "部门",
      rules: "required",
      componentProps: {
        api: getAllDeptListApi,
        optionFilterProp: "label",
        labelField: "deptTitle",
        valueField: "deptId",
        mode: "multiple",
        resultField: "",
      },
    },
    {
      component: "ApiSelect",
      fieldName: "roleIds",
      label: "角色",
      rules: "required",
      renderComponentContent: () => ({
        option: (optionItem: any) => {
          return h(Flex, { gap: 10, align: "center" }, [
            h("div", {}, optionItem.label),
            h("div", { title: optionItem.remark }, optionItem.remark),
          ]);
        },
      }),
      componentProps: {
        api: getAllRoleListApi,
        optionFilterProp: "label",
        labelField: "roleTitle",
        valueField: "roleId",
        mode: "multiple",
        resultField: "",
      },
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: "Input",
      defaultValue: "",
      fieldName: "username",
      label: "登录名",
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: "Input",
      defaultValue: "",
      fieldName: "realName",
      label: "真实姓名",
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: "Select",
      fieldName: "status",
      label: "状态",
      componentProps: {
        allowClear: true,
        options: [
          { label: $t("common.enabled"), value: 1 },
          { label: $t("common.disabled"), value: 0 },
        ],
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns<T = SystemUserApi.SystemUserFace>(
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<T>["columns"] {
  return [
    {
      field: "avatar",
      title: "真实姓名",
      sortable: true,
      sortBy: "realName",
      cellRender: {
        name: "UserAvatar",
        props: {
          avatarField: "avatar",
          nameField: "realName",
        },
      },
    },
    { field: "username", title: "登录名", sortable: true },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: "CellSwitch",
      },
      field: "status",
      title: $t("system.role.status"),
      width: 100,
    },
    { field: "deptTitles", title: "部门" },
    { field: "roleTitles", title: "角色" },
    { field: "desc", title: "描述" },
    { field: "createDate", title: "创建时间" },
    {
      align: "center",
      field: "operation",
      fixed: "right",
      slots: { default: "action" },
      title: "操作",
      width: 180,
    },
  ];
}

/**
 * 用户详情描述列表项
 * @param row 用户数据
 */
export function useDescriptionItems(row?: SystemUserApi.SystemUserFace): DescriptionsItemType[] {
  const enabled = row?.status === 1;
  return [
    { label: $t("system.user.realName"), content: row?.realName },
    { label: $t("system.user.userId"), content: row?.userId },
    { label: $t("system.user.dept"), content: row?.deptTitles.join(",") },
    {
      label: $t("system.user.status"),
      content: () =>
        h(
          Tag,
          {
            color: enabled ? "success" : "error",
          },
          {
            default: () => (enabled ? $t("common.enabled") : $t("common.disabled")),
          },
        ),
    },
    { label: $t("system.user.createTime"), content: row?.createDate },
    { label: $t("system.user.desc"), content: row?.desc },
  ];
}
