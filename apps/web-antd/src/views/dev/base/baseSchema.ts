// console.log('a');

import {
  getProjectsListApi,
  getVersionsListApi,
  getModulesListApi,
  getStoryListApi,
} from '#/api/dev';
import type {
  DevProjectApi,
  DevVersionApi,
  DevStoryApi,
  DevModuleApi,
} from '#/api/dev';
import type { SystemUserApi } from '#/api/system';
import { getUserListAllApi } from '#/api/system';
import { getLocalDictText } from '#/dicts';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import { h, nextTick, ref } from 'vue';
import type { VbenFormSchema } from '#/adapter/form';
import { Flex, Tag, TypographyText } from 'ant-design-vue';
import { useDebounceFn } from '@vueuse/core';
export const projectSchema = (config?: any): VbenFormSchema => {
  const base = {
    component: 'ApiSelect',
    fieldName: 'projectId',
    label: '项目',
    rules: 'required',
    formItemClass: 'col-span-1',
  } as VbenFormSchema;

  return {
    ...base,
    ...config,
    componentProps: (_value: DevProjectApi.DevProjectFace, _formApi: any) => {
      return {
        api: () => getProjectsListApi(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        autoSelect: 'first',
        ...config?.componentProps,
      };
    },
    dependencies: {
      triggerFields: ['projectId'],
      ...config?.dependencies,
    },
  } as VbenFormSchema;
};
export const versionSchema = (config?: any): VbenFormSchema => {
  const base = {
    component: 'ApiSelect',
    fieldName: 'versionId',
    label: '迭代版本',
    rules: 'required',
    formItemClass: 'col-span-1',
  } as VbenFormSchema;
  return {
    ...base,
    ...config,
    renderComponentContent: () => ({
      option: (optionItem: DevVersionApi.DevVersionFace) => {
        const _title =
          (optionItem.remark || '') +
          getLocalDictText('RELEASE_STATUS', optionItem.releaseStatus);

        return h(
          Flex,
          {
            gap: 10,
            align: 'center',
          },
          [h('div', {}, optionItem.label), h('div', { title: _title }, _title)],
        );
      },
    }),
    componentProps: (value: DevVersionApi.DevVersionFace, _formApi: any) => {
      if (!value.projectId) {
        return {};
      }
      return {
        key: `versionId_${value.projectId}`,
        api: () =>
          getVersionsListApi({
            projectId: value.projectId,
            includeId: value.versionId || undefined,
          }),
        labelField: 'version',
        valueField: 'versionId',
        resultField: 'items',
        afterFetch: (res: any) => {
          if (!res.items) {
            _formApi.setFieldValue('versionId', undefined);
          }
          if (res.items && res.items.length > 0) {
            const obj = res.items.find(
              (item: any) => item.versionId === value.versionId,
            );
            if (!obj) {
              _formApi.setFieldValue('versionId', undefined);
            }
          }
        },
        // autoSelect: false,
        autoSelect: 'first',
        ...config?.componentProps,
      };
    },
    dependencies: {
      triggerFields: ['projectId'],
      ...config?.dependencies,
    },
  } as VbenFormSchema;
};

export const moduleSchema = (config?: any): VbenFormSchema => {
  const base = {
    component: 'ApiSelect',
    fieldName: 'moduleId',
    label: '关联模块',
    rules: 'required',
    formItemClass: 'col-span-1',
  } as VbenFormSchema;
  return {
    ...base,
    ...config,
    componentProps: (value: DevModuleApi.DevModuleFace, _formApi: any) => {
      if (!value.projectId) {
        return {};
      }
      return {
        key: `moduleId_${value.projectId}`,
        api: () => getModulesListApi({ projectId: value.projectId }),
        labelField: 'moduleTitle',
        valueField: 'moduleId',
        resultField: '',
        afterFetch: (res: any) => {
          if (!res) {
            _formApi.setFieldValue('moduleId', undefined);
          }
          if (res && res.length > 0) {
            const obj = res.find(
              (item: any) => item.moduleId === value.moduleId,
            );
            if (!obj) {
              _formApi.setFieldValue('moduleId', undefined);
            }
          }
        },
        autoSelect: 'first',
        ...config?.componentProps,
      };
    },
    dependencies: {
      triggerFields: ['projectId', 'storyId'],
      ...config?.dependencies,
    },
  } as VbenFormSchema;
};

export const storySchema = (config?: any): VbenFormSchema => {
  const keyword = ref('');
  const base = {
    component: 'ApiSelect',
    fieldName: 'storyId',
    label: '关联需求',
    formItemClass: 'col-span-1',
  } as VbenFormSchema;
  return {
    ...base,
    ...config,
    renderComponentContent: () => ({
      option: (optionItem: DevStoryApi.DevStoryFace) => {
        return h(Flex, { gap: 10, align: 'center' }, [
          h(
            Tag,
            { style: { height: 'fit-content' } },
            `#${optionItem.storyNum || ''}`,
          ),
          h(TypographyText, { ellipsis: true }, optionItem.label || ''),
          h(UserAvatarGroup, {
            userList: optionItem.userList || [],
          }),
        ]);
      },
      ...config?.renderComponentContent,
    }),
    componentProps: (value: DevStoryApi.DevStoryFace, formApi: any) => {
      if (!value.versionId) {
        return {};
      }

      return {
        key: `storyId_${value.versionId}`,
        api: (_params: any) => getStoryListApi({ ..._params }),
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
        afterFetch: (res: any) => {
          if (!res.items) {
            formApi.setFieldValue('storyId', undefined);
          }
          if (res.items && res.items.length > 0) {
            const obj = res.items.find(
              (item: any) => item.storyId === value.storyId,
            );
            if (!obj) {
              formApi.setFieldValue('storyId', undefined);
            }
          }
        },
        ...config?.componentProps,
      };
    },
    dependencies: {
      triggerFields: ['versionId'],
      ...config?.dependencies,
    },
  } as VbenFormSchema;
};

export const userIdSchema = (config?: any): VbenFormSchema => {
  const base = {
    component: 'ApiSelect',
    fieldName: 'userId',
    label: '执行人',
    rules: 'required',
    formItemClass: 'col-span-1',
  } as VbenFormSchema;
  return {
    ...base,
    ...config,
    renderComponentContent: () => {
      return {
        option: (optionItem: SystemUserApi.SystemUserFace) => {
          return h(UserAvatar, {
            avatar: optionItem.avatar || '',
            name: optionItem.label || '',
          });
        },
        ...config?.renderComponentContent,
      };
    },
    componentProps: {
      api: () => getUserListAllApi(),
      labelField: 'realName',
      valueField: 'userId',
      resultField: 'items',
      showSearch: true,
      allowClear: true,
      filterOption: true,
      optionFilterProp: 'label',
      ...config?.componentProps,
    },
  } as VbenFormSchema;
};
