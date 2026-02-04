import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import { $t } from '#/locales';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录名',
    },
    {
      component: 'Input',
      fieldName: 'realName',
      label: '真实姓名',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Textarea',
      fieldName: 'desc',
      label: '描述',
    },
  ];
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
      fieldName: 'disabled',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 0 },
          { label: $t('common.disabled'), value: 1 },
        ],
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemUserApi.SystemUserFace>,
): VxeTableGridOptions<SystemUserApi.SystemUserFace>['columns'] {
  return [
    {
      field: 'avatar',
      title: '真实姓名',
      cellRender: {
        name: 'UserAvatar',
        props: {
          avatarField: 'avatar',
          nameField: 'realName',
        },
      },
    },
    { field: 'username', title: '登录名' },
    {
      cellRender: { name: 'CellSwitch' },
      field: 'disabled',
      title: '状态',
    },
    { field: 'desc', title: '描述' },
    { field: 'lastLoginIp', title: '最后登录IP' },
    { field: 'lastLoginDate', title: '最后登录时间' },
    {
      align: 'right',
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 110,
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: '',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
          },
        ],
      },
    },
  ];
}
