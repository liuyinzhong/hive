import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { DevTaskApi } from '#/api/dev';

import { getLocalDictList } from '#/dicts';
import { taskRichTemplateText } from '#/template/richText';
import {
  projectSchema,
  versionSchema,
  moduleSchema,
  storySchema,
  userIdSchema,
} from '#/views/dev/base/baseSchema';

import { createTaskExportApi } from '#/api/dev/task';
import { message } from 'antdv-next';
import { $t } from '#/locales';
import { formatVxeTableExportOptions } from '#/utils';
/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskId',
      label: '任务主键id',
      dependencies: {
        triggerFields: ['taskId'],
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
      fieldName: 'taskTitle',
      label: '任务标题',
      rules: 'required',
      formItemClass: 'col-span-3 items-baseline',
    },
    {
      component: 'RangePicker',
      fieldName: 'timeArr',
      label: '开始时间',
      rules: 'required',
      formItemClass: 'col-span-2',
    },
    {
      component: 'InputNumber',
      fieldName: 'planHours',
      label: '计划工时',
      defaultValue: 1,
      rules: 'required',
      formItemClass: 'col-span-1',
      componentProps: {
        min: 0.1,
        precision: 2,
        addonAfter: '小时',
      },
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
      fieldName: 'taskRichText',
      label: '',
      labelWidth: 0,
      defaultValue: taskRichTemplateText,
      formItemClass: 'col-span-2 row-span-8',
      componentProps: {
        editable: true,
        minHeight: 410,
      },
    },
    versionSchema({
      rules: '',
      dependencies: {
        disabled: (value: any) => {
          return value.openModalSource === 'storyListAddBtn';
        },
      },
    }),
    moduleSchema({
      rules: '',
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
      rules: '',
      componentProps: {
        autoSelect: false,
        allowClear: true,
      },
      dependencies: {
        disabled: (value: any) => {
          return value.openModalSource === 'storyListAddBtn';
        },
      },
    }),
    userIdSchema({
      label: '执行人',
    }),

    {
      component: 'ApiSelect',
      fieldName: 'taskStatus',
      label: '任务状态',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      componentProps: {
        api: () => getLocalDictList('TASK_STATUS'),
      },
      dependencies: {
        triggerFields: ['taskId'],
        disabled: (value) => {
          return value.taskId;
        },
      },
    },

    {
      component: 'ApiSelect',
      fieldName: 'taskType',
      label: '任务类型',
      defaultValue: '0',
      formItemClass: 'col-span-1',
      componentProps: {
        api: () => getLocalDictList('TASK_TYPE'),
      },
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
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'taskTitle',
      label: '任务标题',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'taskStatus',
      label: '任务状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        mode: 'multiple',
        api: () => getLocalDictList('TASK_STATUS'),
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<DevTaskApi.DevTaskFace>,
): VxeTableGridOptions<DevTaskApi.DevTaskFace>['columns'] {
  return [
    {
      field: 'taskNum',
      title: '编号',
      width: 60,
      dragSort: false,
      formatter: ({ row }) => `#${row.taskNum}`,
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
      field: 'taskTitle',
      title: '任务标题',
      sortable: true,
      minWidth: 200,
      cellRender: {
        name: 'CellLink',
        events: {
          click: (val: any) => {
            onActionClick && onActionClick({ code: 'taskTitle', row: val });
          },
        },
      },
    },
    {
      width: 120,
      showOverflow: true,
      title: '执行人',
      field: 'userList',
      editRender: {
        name: 'UserSelect',
        props: {},
        events: {
          change: (val: any, row: DevTaskApi.DevTaskFace) => {
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
      field: 'taskStatus',
      title: '任务状态',
      sortable: true,
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'TASK_STATUS',
        },
      },
    },
    {
      field: 'planHours',
      title: '计划工时',
      width: 100,
    },
    {
      field: 'percent',
      title: '任务进度',
      align: 'center',
      width: 130,
      cellRender: {
        name: 'CellProgress',
      },
    },
    {
      field: 'taskType',
      title: '任务类型',
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'TASK_TYPE',
        },
        events: {
          change: (val: any, row: DevTaskApi.DevTaskFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'taskType' },
              });
          },
        },
      },
    },
    {
      field: 'startDate',
      title: '开始时间',
      sortable: true,
      width: 140,
      editRender: {
        name: 'CellDate',
        props: {},
        events: {
          change: (val: any, row: DevTaskApi.DevTaskFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val, key: 'startDate' },
              });
          },
        },
      },
    },
    {
      field: 'endDate',
      title: '结束时间',
      sortable: true,
      width: 140,
      editRender: {
        name: 'CellDate',
        props: {},
        events: {
          change: (val: any, row: DevTaskApi.DevTaskFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val, key: 'endDate' },
              });
          },
        },
      },
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
  ];
}

/** 流转表单配置 */
export function useNextFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskId',
      label: '任务主键id',
      dependencies: {
        triggerFields: ['taskId'],
        show: false,
      },
    },
    {
      component: 'Input',
      fieldName: 'taskStatus',
      label: '任务状态',
      dependencies: {
        triggerFields: ['taskId'],
        show: false,
      },
    },
    {
      component: 'RichEditor',
      fieldName: 'changeRichText',
      label: '',
    },
  ];
}

/** 导出任务 */
export async function createExport(formValues: any, exportOptions: any) {
  await createTaskExportApi({
    ...formatVxeTableExportOptions(exportOptions),
    projectId: formValues.projectId as string | undefined,
    taskStatus: formValues.taskStatus as number[] | undefined,
    taskTitle: formValues.taskTitle as string | undefined,
    versionId: formValues.versionId as string | undefined,
  });
  message.success($t('dev.task.exportCreated'));
}
