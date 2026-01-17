import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import { getDictList } from '#/dicts';
import { $t } from '#/locales';
import { message } from 'ant-design-vue';
import {
  getVersionsList,
  getModulesList,
  getProjectsList,
  type SystemStoryApi,
} from '#/api/dev';
import { getUserListAll } from '#/api/system';
import { upload_file } from '#/api/examples/upload';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'storyTitle',
      label: '需求名称',
      rules: 'required',
      formItemClass: 'col-span-3',
    },
    {
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '项目',
      rules: 'required',
      componentProps: {
        api: () => getProjectsList(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        autoSelect: 'first',
        allowClear: true,
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'versionId',
      label: '迭代版本',
      rules: 'required',
      componentProps: {},
      dependencies: {
        triggerFields: ['projectId'],
        componentProps: async (ctx) => {
          ctx.versionId = undefined;
          const res: any = await getVersionsList({ projectId: ctx.projectId });
          return {
            options: res.items,
            fieldNames: {
              label: 'version',
              value: 'versionId',
            },
          };
        },
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'moduleId',
      label: '关联模块',
      rules: 'required',
      componentProps: {},
      dependencies: {
        triggerFields: ['projectId'],
        componentProps: async (ctx) => {
          ctx.moduleId = undefined;
          const res: any = await getModulesList({ projectId: ctx.projectId });
          return {
            options: res,
            fieldNames: {
              label: 'moduleTitle',
              value: 'moduleId',
            },
          };
        },
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
      rules: 'required',
      defaultValue: '0',
      componentProps: {
        api: () => getDictList('STORY_STATUS'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyType',
      label: '需求类别',
      rules: 'required',
      defaultValue: '0',
      componentProps: {
        api: () => getDictList('STORY_TYPE'),
      },
    },

    {
      component: 'ApiSelect',
      fieldName: 'storyLevel',
      label: '优先级',
      defaultValue: '0',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_LEVEL'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'source',
      label: '需求来源',
      defaultValue: '0',
      rules: 'required',
      componentProps: {
        api: () => getDictList('STORY_SOURCE'),
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
      rules: 'required',
      componentProps: {
        api: () => getProjectsList(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        autoSelect: 'first',
        allowClear: true,
      },
    },
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'storyTitle',
      label: '需求名称',
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '需求状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        api: () => getDictList('STORY_STATUS'),
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemStoryApi.SystemStory>,
): VxeTableGridOptions<SystemStoryApi.SystemStory>['columns'] {
  return [
    {
      field: 'storyNum',
      title: '编号',
      width: 60,
      dragSort: false,
      formatter: ({ row }) => '#' + row.storyNum,
    },
    {
      width: 100,
      field: 'version',
      title: '迭代版本',
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
      field: 'storyTitle',
      title: '需求名称',
      minWidth: 200,
      cellRender: {
        name: 'CellLink',
      },
    },
    {
      width: 120,
      field: 'userList',
      showOverflow: true,
      title: '参与人员',
      editRender: {
        name: 'UserSelect',
        props: {
          mode: 'multiple',
        },
        events: {
          change: (val: any) => {
            message.success(`${JSON.stringify(val)}`);
          },
        },
      },
    },

    {
      field: 'storyType',
      title: '需求类别',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORY_TYPE',
        },
      },
    },
    {
      field: 'storyStatus',
      title: '需求状态',
      width: 100,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'STORY_STATUS',
        },
      },
    },
    {
      width: 100,
      field: 'storyLevel',
      title: '优先级',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORY_LEVEL',
        },
      },
    },
    {
      width: 100,
      field: 'source',
      title: '需求来源',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORY_SOURCE',
        },
      },
    },

    {
      width: 250,
      field: 'operation',
      fixed: 'right',
      title: $t('system.dept.operation'),
      cellRender: {
        attrs: {
          nameField: 'storyNum',
          nameTitle: '需求',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
          },
          {
            code: 'addTask',
            text: '添加任务',
          },
          {
            code: 'next',
            text: '流转',
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
