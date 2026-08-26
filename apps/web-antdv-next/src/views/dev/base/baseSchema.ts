// console.log('a');

import {
  getProjectsListApi,
  getVersionsListApi,
  getModulesListApi,
  getStoryListApi,
} from '#/api/dev';
import type { DevVersionApi, DevStoryApi } from '#/api/dev';
import type { SystemUserApi } from '#/api/system';
import { getUserListAllApi } from '#/api/system';
import { getLocalDictText } from '#/dicts';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import { h, nextTick, ref } from 'vue';
import type { VbenFormSchema } from '#/adapter/form';
import { Flex, Tag, TypographyText } from 'antdv-next';
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
    componentProps: {
      api: () => getProjectsListApi(),
      labelField: 'projectTitle',
      valueField: 'projectId',
      autoSelect: 'first',
      ...config?.componentProps,
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
      optionRender: ({ option }: any) => {
        const _title =
          (option.data.remark || '') +
          getLocalDictText('RELEASE_STATUS', option.data.releaseStatus);

        return h(
          Flex,
          {
            gap: 10,
            align: 'center',
          },
          [h('div', {}, option.label), h('div', { title: _title }, _title)],
        );
      },
    }),
    dependencies: {
      componentProps: (values, formApi) => {
        if (!values.projectId) {
          return { ...config?.componentProps };
        }
        return {
          key: `versionId_${values.projectId}`,
          api: () =>
            getVersionsListApi({
              projectId: values.projectId,
              includeId: values.versionId || undefined,
            }),
          labelField: 'version',
          valueField: 'versionId',
          resultField: 'items',
          afterFetch: (res: any) => {
            if (!res.items) {
              formApi.setFieldValue('versionId', undefined);
            }
            if (res.items && res.items.length > 0) {
              const obj = res.items.find(
                (item: any) => item.versionId === values.versionId,
              );
              if (!obj) {
                formApi.setFieldValue('versionId', undefined);
              }
            }
          },
          // autoSelect: false,
          autoSelect: 'first',
          ...config?.componentProps,
        };
      },
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
    dependencies: {
      componentProps: (values, formApi) => {
        if (!values.projectId) {
          return { ...config?.componentProps };
        }
        return {
          key: `moduleId_${values.projectId}`,
          api: () => getModulesListApi({ projectId: values.projectId }),
          labelField: 'moduleTitle',
          valueField: 'moduleId',
          resultField: '',
          afterFetch: (res: any) => {
            if (!res) {
              formApi.setFieldValue('moduleId', undefined);
            }
            if (res && res.length > 0) {
              const obj = res.find(
                (item: any) => item.moduleId === values.moduleId,
              );
              if (!obj) {
                formApi.setFieldValue('moduleId', undefined);
              }
            }
          },
          autoSelect: 'first',
          ...config?.componentProps,
        };
      },
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
      optionRender: ({ option }: any) => {
        return h(Flex, { gap: 10, align: 'center' }, [
          h(
            Tag,
            { style: { height: 'fit-content' } },
            `#${option.data.storyNum || ''}`,
          ),
          h(TypographyText, { ellipsis: true }, option.label || ''),
          h(UserAvatarGroup, {
            userList: option.data.userList || [],
          }),
        ]);
      },
      ...config?.renderComponentContent,
    }),
    componentProps: () => ({
      /* 当params 中有值变化时，会重新触发api属性 */
      params: {
        keyword: keyword.value || undefined,
      },
    }),
    dependencies: {
      componentProps: (values, formApi) => {
        if (!values.versionId) {
          return { ...config?.componentProps };
        }

        return {
          key: `storyId_${values.versionId}`,
          api: (params: any) =>
            getStoryListApi({
              ...params,
              versionId: values.versionId || undefined,
              projectId: values.projectId || undefined,
              includeId: values.storyId,
            }),
          placeholder: '请输入需求标题、需求编号',
          allowClear: true,
          showSearch: true,
          filterOption: false,
          labelField: 'storyTitle',
          valueField: 'storyId',
          resultField: 'items',
          autoSelect: false,
          onSelect: (_value: any, option: any) => {
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
                (item: any) => item.storyId === values.storyId,
              );
              if (!obj) {
                formApi.setFieldValue('storyId', undefined);
              }
            }
          },
          ...config?.componentProps,
        };
      },
      triggerFields: ['versionId', 'projectId'],
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
        optionRender: ({ option }: any) => {
          return h(UserAvatar, {
            avatar: option.data.avatar || '',
            name: option.data.label || '',
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
