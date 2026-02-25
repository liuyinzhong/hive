import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';
import { message } from 'ant-design-vue';
import {
  getVersionsList,
  getModulesList,
  getProjectsList,
  type DevStoryApi,
  getLastVersion,
} from '#/api/dev';
import { getUserListAll } from '#/api/system';
import { upload_file } from '#/api/examples/upload';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'storyId',
      label: '需求主键id',
      dependencies: {
        triggerFields: ['storyId'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Textarea',
      fieldName: 'storyTitle',
      label: '需求标题',
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
    },
    {
      component: 'ApiSelect',
      fieldName: 'versionId',
      label: '迭代版本',
      rules: 'required',
      componentProps: (value, formApi) => {
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
          // autoSelect: false,
          autoSelect: 'first',
        };
      },
      dependencies: {
        triggerFields: ['projectId'],
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
        triggerFields: ['projectId'],
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'userList',
      label: '参与人员',
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 1,
        api: () => getUserListAll(),
        labelField: 'realName',
        valueField: 'userId',
        resultField: 'items',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '需求状态',
      defaultValue: 0,
      componentProps: {
        api: () => getLocalDictList('STORY_STATUS'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyType',
      label: '需求类型',
      rules: 'required',
      defaultValue: 0,
      componentProps: {
        api: () => getLocalDictList('STORY_TYPE'),
      },
    },

    {
      component: 'ApiSelect',
      fieldName: 'storyLevel',
      label: '优先级',
      defaultValue: 0,
      componentProps: {
        api: () => getLocalDictList('STORY_LEVEL'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'source',
      label: '需求来源',
      defaultValue: 0,
      componentProps: {
        api: () => getLocalDictList('STORY_SOURCE'),
      },
    },
    {
      component: 'Upload',
      fieldName: 'files',
      label: '附件',
      formItemClass: 'col-span-3',
      componentProps: {
        // 更多属性见：https://ant.design/components/upload-cn
        // 自动携带认证信息
        customRequest: upload_file,
        disabled: false,
        maxCount: 10,
        multiple: true,
        showUploadList: true,
        // 上传列表的内建样式，支持四种基本样式 text, picture, picture-card 和 picture-circle
        listType: 'text',
      },
    },
    {
      component: 'AiEditor',
      fieldName: 'storyRichText',
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
      componentProps: () => {
        return {
          api: () => getProjectsList(),
          labelField: 'projectTitle',
          valueField: 'projectId',
          allowClear: true,
        };
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
      component: 'ApiSelect',
      fieldName: 'moduleId',
      label: '关联模块',
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
          autoSelect: '',
          allowClear: true,
        };
      },
      dependencies: {
        triggerFields: ['projectId'],
        componentProps: (value, formApi) => {
          formApi.setFieldValue('moduleId', undefined);
          return {};
        },
      },
    },
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'keyword',
      label: '需求名称',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '需求状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        api: () => getLocalDictList('STORY_STATUS'),
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<DevStoryApi.DevStoryFace>,
): VxeTableGridOptions<DevStoryApi.DevStoryFace>['columns'] {
  return [
    {
      field: 'storyNum',
      title: '编号',
      width: 60,
      dragSort: false,
      formatter: ({ row }) => '#' + row.storyNum,
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
      field: 'storyStatus',
      title: '需求状态',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORY_STATUS',
        },
      },
    },
    {
      field: 'storyTitle',
      title: '需求名称',
      minWidth: 200,
      slots: { default: 'storyTitle' },
      /* cellRender: {
        name: 'CellLink',
        events: {
          click: (val: any) => {
            onActionClick && onActionClick({ code: 'storyTitle', row: val });
          },
        },
      }, */
    },
    {
      width: 165,
      field: 'userList',
      showOverflow: true,
      title: '参与人员',
      editRender: {
        name: 'UserSelect',
        props: {
          mode: 'multiple',
          maxCount: 6,
        },
        events: {
          change: (val: any, row: DevStoryApi.DevStoryFace) => {
            let params = {
              storyId: row.storyId,
              userIds: val,
            };
            console.log(params);
            message.success(`控制台已输出`);
          },
        },
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
      field: 'storyType',
      title: '需求类型',
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'STORY_TYPE',
        },
        events: {
          change: (val: any, row: DevStoryApi.DevStoryFace) => {
            let params = {
              storyId: row.storyId,
              storyType: val,
            };
            console.log(params);
            message.success(`控制台已输出`);
          },
        },
      },
    },

    {
      width: 80,
      field: 'storyLevel',
      title: '优先级',
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'STORY_LEVEL',
        },
        events: {
          change: (val: any, row: DevStoryApi.DevStoryFace) => {
            let params = {
              storyId: row.storyId,
              storyLevel: val,
            };
            console.log(params);
            message.success(`控制台已输出`);
          },
        },
      },
    },
    {
      width: 100,
      field: 'source',
      title: '需求来源',
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'STORY_SOURCE',
        },
        events: {
          change: (val: any, row: DevStoryApi.DevStoryFace) => {
            let params = {
              storyId: row.storyId,
              source: val,
            };
            console.log(params);
            message.success(`控制台已输出`);
          },
        },
      },
    },

    {
      width: 200,
      field: 'operation',
      fixed: 'right',
      title: $t('system.dept.operation'),
      cellRender: {
        attrs: {
          nameField: 'storyTitle',
          nameTitle: '需求',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'addTask',
            icon: 'lucide:badge-plus',
            tips: '添加任务',
            disabled: (row: DevStoryApi.DevStoryFace) => {
              if (
                row.versionId &&
                row.storyStatus > 0 &&
                row.storyStatus < 99
              ) {
                return false;
              } else {
                return true;
              }
            },
          },

          {
            code: 'addBug',
            icon: 'lucide:bug',
            tips: '添加缺陷',
            disabled: (row: DevStoryApi.DevStoryFace) => {
              if (row.versionId && row.storyStatus > 0) {
                return false;
              } else {
                return true;
              }
            },
          },
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
      fieldName: 'storyId',
      label: '需求id',
      dependencies: {
        triggerFields: ['storyId'],
        show: false,
      },
    },
    {
      component: 'Input',
      fieldName: 'storyStatus',
      label: '需求状态',
      dependencies: {
        triggerFields: ['storyId'],
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
