import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { DevStoryApi } from '#/api/dev';
import { upload_file } from '#/api/examples/upload';
import { getProjectUsersApi } from '#/api/dev';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';
import { storyRichTemplateText } from '#/template/richText';
import {
  projectSchema,
  versionSchema,
  moduleSchema,
} from '#/views/dev/base/baseSchema';

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
      formItemClass: 'col-span-10 items-baseline',
    },

    projectSchema({
      formItemClass: 'col-span-2',
      dependencies: {
        componentProps: (values: any, formApi: any) => {
          /* 新建需求时,选择项目后自动填充默认参与人及负责状态 */
          if (values.projectId && !values.storyId) {
            getProjectUsersApi(values.projectId).then((users) => {
              const userList: { userId: string; storyStatus: string }[] = [];
              for (const u of users) {
                if (!u.storyStatus) continue;
                const statuses = u.storyStatus.split(',');
                for (const s of statuses) {
                  userList.push({ userId: u.userId, storyStatus: s });
                }
              }
              // 按负责状态值升序，与字典排序规则保持一致
              userList.sort((a, b) => Number(a.storyStatus) - Number(b.storyStatus));
              formApi.setFieldValue('userList', userList);
            });
          }
          return {};
        },
      },
    }),
    {
      component: 'RichEditor',
      fieldName: 'storyRichText',
      label: '',
      labelWidth: 0,
      defaultValue: storyRichTemplateText,
      formItemClass: 'col-span-5 row-span-10 items-baseline',

      componentProps: {
        editable: true,
        minHeight: 410,
      },
    },
    {
      arrayProps: {
        addButtonText: $t('dev.story.addStoryUser'),
        showIndex: false,
        createRow: () => ({
          userId: '',
          storyStatus: undefined,
        }),
        max: 50,
        min: 0,
      },
      children: [
        {
          component: 'ApiSelect',
          dependencies: {
            componentProps: (values: any) => ({
              allowClear: true,
              key: `storyUser_${values.projectId}`,
              api: () => getProjectUsersApi(values.projectId),
              labelField: 'realName',
              valueField: 'userId',
              showSearch: true,
              filterOption: true,
              optionFilterProp: 'label',
            }),
            triggerFields: ['projectId'],
          },
          fieldName: 'userId',
          label: $t('dev.story.storyUser'),
        },
        {
          component: 'ApiSelect',
          componentProps: {
            allowClear: true,
            api: () => getLocalDictList('STORY_STATUS'),
          },
          fieldName: 'storyStatus',
          label: $t('dev.story.storyStatusOwner'),
        },
      ],
      fieldName: 'userList',
      label: $t('dev.story.storyUsers'),
      formItemClass: 'col-span-3 row-span-10 items-baseline ',
      type: 'array',
      hideLabel: true,
    },

    versionSchema({ formItemClass: 'col-span-2' }),
    moduleSchema({ formItemClass: 'col-span-2' }),

    {
      component: 'ApiSelect',
      fieldName: 'storyStatus',
      label: '需求状态',
      defaultValue: '0',
      formItemClass: 'col-span-2',
      componentProps: {
        api: () => getLocalDictList('STORY_STATUS'),
      },
      dependencies: {
        triggerFields: ['storyId'],
        disabled(row: any) {
          return row.storyId;
        },
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'storyType',
      label: '需求类型',
      rules: 'required',
      defaultValue: '0',
      formItemClass: 'col-span-2',
      componentProps: {
        api: () => getLocalDictList('STORY_TYPE'),
      },
    },

    {
      component: 'ApiSelect',
      fieldName: 'storyLevel',
      label: '优先级',
      formItemClass: 'col-span-2',
      defaultValue: '0',
      componentProps: {
        api: () => getLocalDictList('STORY_LEVEL'),
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'source',
      label: '需求来源',
      defaultValue: '0',
      formItemClass: 'col-span-2',
      componentProps: {
        api: () => getLocalDictList('STORY_SOURCE'),
      },
    },
    {
      component: 'Upload',
      fieldName: 'fileIds',
      label: '附件',
      formItemClass: 'col-span-2',
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
        mode: 'multiple',
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
      formatter: ({ row }) => `#${row.storyNum}`,
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
      sortable: true,
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'STORY_STATUS',
        },
      },
    },
    {
      field: 'thisUserList',
      title: $t('dev.story.currentOwner'),
      width: 110,
      showOverflow: true,
      cellRender: {
        name: 'UserAvatarGroup',
      },
    },
    {
      field: 'storyTitle',
      title: '需求名称',
      sortable: true,
      minWidth: 200,
      cellRender: {
        name: 'CellLink',
        events: {
          click: (val: any) => {
            onActionClick && onActionClick({ code: 'storyTitle', row: val });
          },
        },
      },
    },
    {
      width: 165,
      field: 'userList',
      showOverflow: true,
      title: $t('dev.story.storyUsers'),
      cellRender: {
        name: 'UserAvatarGroup',
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
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'storyType' },
              });
          },
        },
      },
    },

    {
      width: 90,
      field: 'storyLevel',
      title: '优先级',
      sortable: true,
      editRender: {
        name: 'DictSelect',
        props: {
          type: 'STORY_LEVEL',
        },
        events: {
          change: (val: any, row: DevStoryApi.DevStoryFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'storyLevel' },
              });
          },
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
      /* editRender: {
        name: 'DictSelect',
        props: {
          type: 'STORY_SOURCE',
        },
        events: {
          change: (val: any, row: DevStoryApi.DevStoryFace) => {
            onActionClick &&
              onActionClick({
                code: 'updateField',
                row: { ...row, value: val || [], key: 'source' },
              });
          },
        },
      }, */
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
      fieldName: 'storyId',
      label: '需求主键id',
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
      component: 'RichEditor',
      fieldName: 'changeRichText',
      label: '',
      labelWidth: 30,
    },
  ];
}
