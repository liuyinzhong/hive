// console.log('a');

import {
  getProjectsListApi,
  getVersionsListApi,
  getModulesListApi,
} from '#/api/dev';
import { getLocalDictText } from '#/dicts';
import { h } from 'vue';

import { Flex } from 'ant-design-vue';
export const projectSchema = (config?: any) => {
  return {
    component: 'ApiSelect',
    fieldName: 'projectId',
    label: '项目',
    rules: 'required',
    formItemClass: 'col-span-1',
    componentProps: (_value: any, _formApi: any) => {
      return {
        api: () => getProjectsListApi(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        ...config?.componentProps,
      };
    },
  };
};

export const versionSchema = () => {
  return {
    component: 'ApiSelect',
    fieldName: 'versionId',
    label: '迭代版本',
    rules: 'required',
    formItemClass: 'col-span-1',
    renderComponentContent: () => ({
      option: (optionItem: any) => {
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
    componentProps: (value: any, _formApi: any) => {
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
        // autoSelect: false,
        autoSelect: 'first',
      };
    },
    dependencies: {
      triggerFields: ['projectId'],
      componentProps: (value: any, formApi: any) => {
        formApi.setFieldValue('versionId', undefined);
        return {};
      },
    },
  };
};

export const moduleSchema = () => {
  return {
    component: 'ApiSelect',
    fieldName: 'moduleId',
    label: '关联模块',
    rules: 'required',
    formItemClass: 'col-span-1',
    componentProps: (value: any, _formApi: any) => {
      if (!value.projectId) {
        return {};
      }
      return {
        key: `moduleId_${value.projectId}`,
        api: () => getModulesListApi({ projectId: value.projectId }),
        labelField: 'moduleTitle',
        valueField: 'moduleId',
        resultField: '',
        autoSelect: 'first',
      };
    },
    dependencies: {
      triggerFields: ['projectId'],
      componentProps: (value: any, formApi: any) => {
        formApi.setFieldValue('moduleId', undefined);
        return {};
      },
    },
  };
};
