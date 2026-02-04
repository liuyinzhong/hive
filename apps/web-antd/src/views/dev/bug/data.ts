import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';
import {
  getVersionsList,
  getModulesList,
  getProjectsList,
  getStoryList,
  type DevBugApi,
} from '#/api/dev';
import { getUserListAll } from '#/api/system';
import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import UserAvatar from '#/adapter/component/table/UserAvatar';
import { h, nextTick, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { Tag, Flex, TypographyText } from 'ant-design-vue';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  const keyword = ref('');
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
      renderComponentContent: () => {
        return {
          option: (optionItem: any) => {
            let userList = UserAvatarGroup.renderTableDefault(
              { name: 'UserAvatarGroup', props: { size: 'small' } },
              { row: optionItem },
            );
            return h(Flex, { gap: 10 }, [
              h(Tag, {}, '#' + optionItem.storyNum || ''),
              h(TypographyText, { ellipsis: true }, optionItem.label || ''),
              userList,
            ]);
          },
        };
      },
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
      label: '修复人',
      rules: 'required',
      renderComponentContent: () => {
        return {
          option: (optionItem: any) => {
            let avatar = UserAvatar.renderTableDefault(
              {
                name: 'UserAvatar',
                props: {
                  avatarField: 'avatar',
                  nameField: 'label',
                  size: 'small',
                },
              },
              { row: optionItem },
            );
            return h(avatar);
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
      component: 'Select',
      fieldName: 'bugLevel',
      label: '级别',
      defaultValue: 30,
      componentProps: {
        options: getLocalDictList('BUG_LEVEL'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugEnv',
      label: '环境',
      defaultValue: 0,
      componentProps: {
        options: getLocalDictList('BUG_ENV'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugStatus',
      label: '缺陷状态',
      defaultValue: 0,
      componentProps: {
        options: getLocalDictList('BUG_STATUS'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugSource',
      label: '来源',
      defaultValue: 0,
      componentProps: {
        options: getLocalDictList('BUG_SOURCE'),
      },
    },
    {
      component: 'Select',
      fieldName: 'bugType',
      label: '缺陷类型',
      defaultValue: 0,
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
      formItemClass: 'col-span-3',
    },
    {
      component: 'AiEditor',
      fieldName: 'bugRichText',
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
      component: 'Select',
      fieldName: 'bugStatus',
      label: '状态',
      componentProps: {
        options: getLocalDictList('BUG_STATUS'),
      },
    },
    {
      component: 'Input',
      fieldName: 'bugTitle',
      label: '标题',
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
      cellRender: {
        name: 'UserAvatar',
        props: {
          avatarField: 'avatar',
          nameField: 'realName',
        },
      },
    },

    {
      title: '缺陷状态',
      field: 'bugStatus',
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
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_LEVEL',
        },
      },
    },
    {
      title: '环境',
      field: 'bugEnv',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_ENV',
        },
      },
    },
    {
      title: '缺陷类型',
      field: 'bugType',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_TYPE',
        },
      },
    },
    {
      title: '来源',
      field: 'bugSource',
      width: 100,
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'BUG_SOURCE',
        },
      },
    },

    {
      width: 120,
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
      fieldName: 'bugId',
      label: '缺陷id',
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
        triggerFields: ['bugId'],
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
