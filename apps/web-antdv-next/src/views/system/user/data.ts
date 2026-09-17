import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { SystemUserApi } from '#/api/system';
import type { DescriptionsItemType } from '@vben/common-ui';

import { Tag, Flex } from 'antdv-next';

import { h } from 'vue';

import { z } from '#/adapter/form';
import {
  getAllDeptListApi,
  getAllRoleListApi,
  getUserListAllApi,
  updateUserStatusApi,
} from '#/api/system';
import { $t } from '#/locales';
import { passwordSchema } from '#/utils/password';

/** 重置密码表单配置：管理员为目标用户直接设置新密码 */
export function useResetPasswordFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'VbenInputPassword',
      fieldName: 'newPassword',
      label: '新密码',
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入新密码',
      },
      rules: passwordSchema,
    },
    {
      component: 'VbenInputPassword',
      fieldName: 'confirmPassword',
      label: '确认密码',
      componentProps: {
        placeholder: '请再次输入新密码',
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ error: '请再次输入新密码' })
            .min(1, { message: '请再次输入新密码' })
            .refine((value) => value === newPassword, {
              message: '两次输入的密码不一致',
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
}

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      label: '用户表主键id',
      fieldName: 'userId',
      rules: 'required',
      dependencies: {
        triggerFields: ['userId'],
        show: false,
      },
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: '真实姓名',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号',
      componentProps: {
        maxlength: 11,
      },
      rules: z
        .string()
        .length(11, $t('ui.formRules.length', ['手机号', 11]))
        .regex(/^\d{11}$/, '手机号格式不正确'),
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录名',
      rules: z
        .string()
        .min(1, { message: '请输入登录名' })
        .regex(/^[A-Za-z0-9]+$/, { message: '登录名只能输入英文字母和数字' })
        .refine((value) => value.toLowerCase() !== 'superadmin', {
          message: '登录名不能为 superAdmin',
        }),
    },

    {
      component: 'VbenInputPassword',
      fieldName: 'password',
      label: '密码',
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入密码',
      },
      rules: passwordSchema,
      dependencies: {
        triggerFields: ['userId'],
        if: (values) => !values.userId,
      },
    },
    {
      component: 'Textarea',
      fieldName: 'desc',
      label: '描述',
    },
    {
      component: 'ApiSelect',
      fieldName: 'leaderUserId',
      label: $t('system.user.leader'),
      componentProps: {
        allowClear: true,
        api: getUserListAllApi,
        optionFilterProp: 'label',
        labelField: 'realName',
        valueField: 'userId',
        resultField: '',
        showSearch: true,
      },
    },
    {
      component: 'ApiTreeSelect',
      fieldName: 'deptIds',
      label: '部门',
      rules: 'required',
      componentProps: {
        api: getAllDeptListApi,
        optionFilterProp: 'label',
        labelField: 'deptTitle',
        valueField: 'deptId',
        multiple: true,
        resultField: '',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'roleIds',
      label: '角色',
      rules: 'required',
      renderComponentContent: () => ({
        optionRender: ({ option }: any) => {
          return h(Flex, { gap: 10, align: 'center' }, [
            h('div', {}, option.label),
            h('div', { title: option.data.remark }, option.data.remark),
            h('div', {}, `${option.data.permissionsCount ?? 0}个权限`),
          ]);
        },
      }),
      componentProps: {
        api: getAllRoleListApi,
        optionFilterProp: 'label',
        labelField: 'roleTitle',
        valueField: 'roleId',
        mode: 'multiple',
        resultField: '',
      },
    },
  ];
}

/**
 * 组装权限摘要文本：始终显示全三项（额外授权/禁止为 0 时也展示）
 * @param row 用户列表行数据
 */
export function formatPermissionSummary(
  row: SystemUserApi.SystemUserFace,
): string {
  const roleCount = row.roleIds?.length ?? 0;
  return `${roleCount}个角色共${row.rolePermissionCount ?? 0}个、额外授权${row.grantCount ?? 0}个、禁止${row.denyCount ?? 0}个`;
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'username',
      label: '登录名',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'realName',
      label: '真实姓名',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'roleId',
      label: '角色',
      componentProps: {
        allowClear: true,
        api: getAllRoleListApi,
        optionFilterProp: 'label',
        labelField: 'roleTitle',
        valueField: 'roleId',
        resultField: '',
        showSearch: true,
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @param onShowPermission 权限明细单元格点击回调；仅在当前用户持有 system:user:permission 权限码且传入回调时渲染为链接，否则保持静态文本
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(): VxeTableGridOptions<SystemUserApi.SystemUserFace>['columns'] {
  return [
    {
      field: 'avatar',
      title: '真实姓名',
      sortable: true,
      sortBy: 'realName',
      cellRender: {
        name: 'UserAvatar',
        props: {
          avatarField: 'avatar',
          nameField: 'realName',
        },
      },
    },
    { field: 'username', title: '登录名', sortable: true },
    {
      cellRender: {
        attrs: {
          onChange: (newStatus: 0 | 1, row: SystemUserApi.SystemUserFace) =>
            updateUserStatusApi(row.userId, { status: newStatus }),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },
    { field: 'deptTitles', title: '部门' },
    { field: 'leaderUserName', title: '直属上级' },
    { field: 'phone', title: '手机号' },
    {
      field: 'permissionSummary',
      title: '权限明细',
      formatter: (params: any) => formatPermissionSummary(params.row),
    },
    { field: 'desc', title: '描述' },
    { field: 'createDate', title: '创建时间' },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 250,
    },
  ];
}

/**
 * 用户详情描述列表项
 * @param row 用户数据
 */
export function useDescriptionItems(
  row?: SystemUserApi.SystemUserFace,
): DescriptionsItemType[] {
  const enabled = row?.status === 1;
  return [
    { label: $t('system.user.realName'), content: row?.realName },
    { label: $t('system.user.userId'), content: row?.userId },
    { label: $t('system.user.dept'), content: row?.deptTitles.join(',') },
    {
      label: $t('system.user.status'),
      content: () =>
        h(
          Tag,
          {
            color: enabled ? 'success' : 'error',
          },
          {
            default: () =>
              enabled ? $t('common.enabled') : $t('common.disabled'),
          },
        ),
    },
    { label: $t('system.user.createTime'), content: row?.createDate },
    { label: $t('system.user.desc'), content: row?.desc },
  ];
}
