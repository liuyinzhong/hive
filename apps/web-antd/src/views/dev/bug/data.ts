import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { DevBugApi } from '#/api/dev';

import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';
import { bugRichTemplateText } from '#/template/richText';
import {
  projectSchema,
  versionSchema,
  moduleSchema,
  storySchema,
  userIdSchema,
} from '#/views/dev/base/baseSchema';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'bugId',
      label: '缺陷主键id',
      dependencies: {
        triggerFields: ['bugId'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'openModalSource',
      dependencies: {
        triggerFields: ['openModalSource'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Textarea',
      fieldName: 'bugTitle',
      label: '缺陷标题',
      rules: 'required',
      formItemClass: 'col-span-3',
    },

    projectSchema({
      dependencies: {
        disabled: (value: any) => {
          return value.openModalSource === 'storyListAddBtn';
        },
      },
    }),
    {
      component: 'RichEditor',
      fieldName: 'bugRichText',
      label: '',
      labelWidth: 0,
      formItemClass: 'col-span-2 row-span-12',
      componentProps: {
        editable: true,
        minHeight: 410,
        modelValue: bugRichTemplateText,
      },
    },
    versionSchema({
      dependencies: {
        disabled: (value: any) => {
          return value.openModalSource === 'storyListAddBtn';
        },
      },
    }),
    moduleSchema({
      dependencies: {
        disabled: (value: any) => {
          return (
            Boolean(value.storyId) ||
            value.openModalSource === 'storyListAddBtn'
          );
        },
      },
    }),
    storySchema({
      dependencies: {
        disabled: (value: any) => {
          return value.openModalSource === 'storyListAddBtn';
        },
      },
    }),
    userIdSchema({
      label: '修复人',
    }),
    {
      component: 'Select',
      fieldName: 'bugLevel',
      label: '级别',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      componentProps: {
        options: getLocalDictList('BUG_LEVEL'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugEnv',
      label: '环境',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      componentProps: {
        options: getLocalDictList('BUG_ENV'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugStatus',
      label: '缺陷状态',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      dependencies: {
        triggerFields: ['bugId'],
        disabled: (value) => value.bugId,
        show: false,
      },
      componentProps: {
        options: getLocalDictList('BUG_STATUS'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugSource',
      label: '来源',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      componentProps: {
        options: getLocalDictList('BUG_SOURCE'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugType',
      label: '缺陷类型',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      componentProps: {
        options: getLocalDictList('BUG_TYPE'),
      },
    },
    {
      component: 'Input',
      fieldName: 'bugUa',
      label: '浏览器信息',
      disabled: true,
      defaultValue: navigator.userAgent,
      formItemClass: 'col-span-1',
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    projectSchema({
      rules: '',
      componentProps: {
        autoSelect: false,
        allowClear: true,
      },
    }),
    versionSchema({
      rules: '',
      componentProps: {
        autoSelect: false,
        allowClear: true,
      },
    }),
    moduleSchema({
      rules: '',
      componentProps: {
        autoSelect: false,
        allowClear: true,
      },
    }),
    {
      component: 'Select',
      fieldName: 'bugStatus',
      label: '状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        mode: 'multiple',
        options: getLocalDictList('BUG_STATUS'),
      },
    },
    {
      component: 'Input',
      fieldName: 'bugTitle',
      label: '标题',
      componentProps: {
        allowClear: true,
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<DevBugApi.DevBugFace>,
): VxeTableGridOptions<DevBugApi.DevBugFace>['columns'] {
  return [
    {
      title: '编号',
      field: 'bugNum',
      width: 65,
      formatter: (row: any) => {
        return `#${row.cellValue}`;
      },
    },
    {
      field: 'projectTitle',
      title: '项目',
      width: 60,
    },
    {
      width: 80,
      field: 'version',
      title: '迭代版本',
      cellRender: {
        name: 'CellTag',
      },
    },
    {
      width: 100,
      field: 'moduleTitle',
      title: '项目模块',
      cellRender: {
        name: 'CellTag',
      },
    },
    {
      field: 'bugTitle',
      title: '缺陷标题',
      sortable: true,
      minWidth: 200,
      cellRender: {
        name: 'CellLink',
        events: {
          click: (val: any) => {
            onActionClick && onActionClick({ code: 'bugTitle', row: val });
          },
        },
      },
    },
    {
      width: 120,
      showOverflow: true,
      title: '修复人',
      field: 'userList',
      editRender: {
        name: 'UserSelect',
        props: {},
        events: {
          change: (val: any, row: DevBugApi.DevBugFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'userId' },
              });
          },
        },
      },
    },

    {
      title: '确认状态',
      field: 'bugConfirmStatus',
      sortable: true,
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_CONFIRM_STATUS',
        },
      },
    },
    {
      title: '缺陷状态',
      field: 'bugStatus',
      sortable: true,
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_STATUS',
        },
      },
    },
    {
      title: '级别',
      field: 'bugLevel',
      sortable: true,
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'BUG_LEVEL',
        },
        events: {
          change: (val: any, row: DevBugApi.DevBugFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'bugLevel' },
              });
          },
        },
      },
    },
    {
      title: '环境',
      field: 'bugEnv',
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'BUG_ENV',
        },
        events: {
          change: (val: any, row: DevBugApi.DevBugFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'bugEnv' },
              });
          },
        },
      },
    },
    {
      title: '缺陷类型',
      field: 'bugType',
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'BUG_TYPE',
        },
        events: {
          change: (val: any, row: DevBugApi.DevBugFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'bugType' },
              });
          },
        },
      },
    },
    {
      title: '来源',
      field: 'bugSource',
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'BUG_SOURCE',
        },
        events: {
          change: (val: any, row: DevBugApi.DevBugFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'bugSource' },
              });
          },
        },
      },
    },

    {
      width: 150,
      field: 'operation',
      fixed: 'right',
      title: $t('system.dept.operation'),
      cellRender: {
        attrs: {
          nameField: 'bugTitle',
          nameTitle: '缺陷',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'confirmBug',
            icon: 'lucide:circle-check',
            tips: '确认bug按钮',
            /* 确认已是bug时。禁止重复确认、bug已关闭时禁止确认 */
            disabled: (row: DevBugApi.DevBugFace) => {
              return row.bugConfirmStatus !== '0' || row.bugStatus === '99';
            },
          },
          {
            code: 'next',
            icon: 'lucide:redo-dot',
            tips: '流转按钮',
            disabled: (row: DevBugApi.DevBugFace) => {
              /* 待确认时，禁止流转bug 、bug已关闭时禁止流转 */
              return row.bugConfirmStatus === '0' || row.bugStatus === '99';
            },
          },
          {
            code: 'edit', // 默认的编辑按钮
            icon: 'lucide:pencil-line',
            text: '',
            tips: '编辑按钮',
          },
          {
            code: 'delete', // 默认的删除按钮
            icon: 'lucide:trash-2',
            text: '',
            tips: '删除按钮',
          },
        ],
      },
    },
  ];
}

/** 流转表单配置 */
export function useNextFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'bugId',
      label: '缺陷主键id',
      dependencies: {
        triggerFields: ['bugId'],
        show: false,
      },
    },
    {
      component: 'Input',
      fieldName: 'bugStatus',
      label: '缺陷状态',
      dependencies: {
        show: false,
        triggerFields: ['bugId'],
      },
    },
    {
      component: 'RichEditor',
      fieldName: 'changeRichText',
    },
  ];
}
