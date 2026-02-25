import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import { getLocalDictList } from '#/dicts';
import { useDebounceFn } from '@vueuse/core';
import { $t } from '#/locales';
import { ref, nextTick, h } from 'vue';
import { Tag, Flex, TypographyText } from 'ant-design-vue';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import {
  getVersionsList,
  getModulesList,
  getProjectsList,
  type DevTaskApi,
  getStoryList,
} from '#/api/dev';
import { getUserListAll } from '#/api/system';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  const keyword = ref('');

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
      formItemClass: 'col-span-3',
    },
    {
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '项目',
      rules: 'required',
      componentProps: (value: any, formApi: any) => {
        return {
          api: () => getProjectsList(),
          labelField: 'projectTitle',
          valueField: 'projectId',
          autoSelect: 'first',
        };
      },
      dependencies: {
        triggerFields: ['projectId'],
        disabled: (value) => {
          return value.openModalSource === 'storyListAddBtn' ? true : false;
        },
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'versionId',
      label: '迭代版本',
      rules: 'required',
      componentProps: (value: any, formApi: any) => {
        if (!value.projectId) {
          return {};
        }
        return {
          key: 'versionId_' + value.projectId,
          api: () =>
            getVersionsList({
              projectId: value.projectId,
              includeId: value.versionId || undefined,
            }),
          labelField: 'version',
          valueField: 'versionId',
          resultField: 'items',
          autoSelect: false,
        };
      },
      dependencies: {
        triggerFields: ['projectId'],
        disabled: (value) => {
          return value.openModalSource === 'storyListAddBtn' ? true : false;
        },
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'moduleId',
      label: '关联模块',
      rules: 'required',
      componentProps: (value, formApi) => {
        if (!value.projectId) {
          return {};
        }
        return {
          key: 'moduleId_' + value.projectId,
          api: () => getModulesList({ projectId: value.projectId }),
          labelField: 'moduleTitle',
          valueField: 'moduleId',
          resultField: '',
          autoSelect: 'first',
        };
      },
      dependencies: {
        triggerFields: ['projectId', 'storyId'],
        disabled: (value) => {
          return (
            Boolean(value.storyId) ||
            value.openModalSource === 'storyListAddBtn'
          );
        },
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyId',
      label: '关联需求',
      formItemClass: 'col-span-3',
      renderComponentContent: () => ({
        option: (optionItem: any) => {
          return h(Flex, { gap: 10, align: 'center' }, [
            h(
              Tag,
              { style: { height: 'fit-content' } },
              '#' + optionItem.storyNum || '',
            ),
            h(TypographyText, { ellipsis: true }, optionItem.label || ''),
            h(UserAvatarGroup, {
              userList: optionItem.userList || [],
            }),
          ]);
        },
      }),
      componentProps: (value, formApi) => {
        if (!value.versionId) {
          return {};
        }

        return {
          api: (_params: any) => getStoryList({ ..._params }),
          /* 当params 中有值变化时，会重新触发api属性 */
          params: {
            keyword: keyword.value || undefined,
            versionId: value.versionId || undefined,
            projectId: value.projectId || undefined,
            includeId: value.storyId,
          },
          placeholder: '请输入需求标题、需求编号',
          allowClear: true,
          showSearch: true,
          filterOption: false,
          labelField: 'storyTitle',
          valueField: 'storyId',
          resultField: 'items',
          autoSelect: false,
          onSelect: (value: any, option: any) => {
            keyword.value = '';
            nextTick(() => {
              formApi.setFieldValue('moduleId', option.moduleId || undefined);
            });
          },
          onSearch: useDebounceFn((value: string) => {
            keyword.value = value;
          }, 700),
        };
      },
      dependencies: {
        triggerFields: ['versionId'],
        disabled: (value) => {
          return value.openModalSource === 'storyListAddBtn' ? true : false;
        },
      },
    },

    {
      component: 'ApiSelect',
      fieldName: 'userId',
      label: '执行人',
      rules: 'required',
      renderComponentContent: () => {
        return {
          option: (optionItem: any) => {
            return h(UserAvatar, {
              avatar: optionItem.avatar || '',
              name: optionItem.label || '',
            });
          },
        };
      },
      componentProps: {
        api: () => getUserListAll(),
        labelField: 'realName',
        valueField: 'userId',
        resultField: 'items',
        showSearch: true,
        allowClear: true,
        filterOption: true,
        optionFilterProp: 'label',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'timeArr',
      label: '开始时间',
      rules: 'required',
      formItemClass: 'col-span-2',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },

    /* {
      component: 'InputNumber',
      fieldName: 'actualHours',
      label: '实际工时',
      defaultValue: 0,
    }, */

    {
      component: 'ApiSelect',
      fieldName: 'taskStatus',
      label: '任务状态',
      defaultValue: 0,
      componentProps: {
        api: () => getLocalDictList('TASK_STATUS'),
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'planHours',
      label: '计划工时',
      defaultValue: 0,
      rules: 'required',
      componentProps: {
        min: 0,
        precision: 2,
        addonAfter: '小时',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'taskType',
      label: '任务类型',
      defaultValue: 0,
      componentProps: {
        api: () => getLocalDictList('TASK_TYPE'),
      },
    },

    {
      component: 'AiEditor',
      fieldName: 'taskRichText',
      label: '内容',
      formItemClass: 'col-span-3',
      componentProps: {},
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '项目',
      componentProps: {
        api: () => getProjectsList(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'versionId',
      label: '迭代版本',
      componentProps: (value, formApi) => {
        if (!value.projectId) {
          return {};
        }
        return {
          key: 'versionId_' + value.projectId,
          api: () =>
            getVersionsList({
              projectId: value.projectId,
              page: 1,
              pageSize: 100,
            }),
          labelField: 'version',
          valueField: 'versionId',
          resultField: 'items',
          allowClear: true,
        };
      },
      dependencies: {
        triggerFields: ['projectId'],
        componentProps: (value, formApi) => {
          formApi.setFieldValue('versionId', undefined);
          return {};
        },
      },
    },
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
      formatter: ({ row }) => '#' + row.taskNum,
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
      cellRender: {
        name: 'UserAvatar',
        props: {
          avatarField: 'avatar',
          nameField: 'realName',
        },
      },
    },
    {
      field: 'taskStatus',
      title: '任务状态',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'TASK_STATUS',
        },
      },
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
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'TASK_TYPE',
        },
      },
    },
    {
      field: 'startDate',
      title: '开始时间',
      width: 100,
    },
    {
      field: 'endDate',
      title: '结束时间',
      width: 100,
    },
    {
      width: 120,
      field: 'operation',
      fixed: 'right',
      title: $t('system.dept.operation'),
      cellRender: {
        attrs: {
          nameField: 'taskTitle',
          nameTitle: '任务',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'next',
            icon: 'lucide:redo-dot',
            tips: '流转按钮',
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
      fieldName: 'taskId',
      label: '任务id',
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
      component: 'AiEditor',
      fieldName: 'commentRichText',
      label: '',
    },
  ];
}
