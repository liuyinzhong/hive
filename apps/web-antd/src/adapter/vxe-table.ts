import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { ComponentType } from './component';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { get, isFunction, isString } from '@vben/utils';

import { objectOmit } from '@vueuse/core';
import { Button, Popconfirm, Switch, Tag } from 'ant-design-vue';

import CellImage from '#/adapter/component/table/CellImage';
import CellLink from '#/adapter/component/table/CellLink';
import DictSelect from '#/adapter/component/table/DictSelect';
import DictTag from '#/adapter/component/table/DictTag';
import UserAvatar from '#/adapter/component/table/UserAvatar';
import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import CellProgress from '#/adapter/component/table/CellProgress';
import CellTag from './component/table/CellTag';
import CellSwitch from './component/table/CellSwitch';
import CellOperation from './component/table/CellOperation';
import { $t } from '#/locales';

import UserSelect from './component/table/UserSelect';
import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'left',
        height: 'auto',
        border: true,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: '',
          },
          showActionMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      } as VxeTableGridOptions,
    });

    /**
     * 解决vxeTable在热更新时可能会出错的问题
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', CellImage);

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', CellLink);

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add

    // 单元格渲染： Tag
    vxeUI.renderer.add('CellTag', CellTag);

    vxeUI.renderer.add('CellSwitch', CellSwitch);

    /**
     * 注册表格的操作按钮渲染器
     */
    vxeUI.renderer.add('CellOperation', CellOperation);

    // 表格配置项可以用 cellRender: { name: 'DictTag' },
    vxeUI.renderer.add('DictTag', DictTag);

    // 表格配置项可以用 cellRender: { name: 'UserAvatar' },
    vxeUI.renderer.add('UserAvatarGroup', UserAvatarGroup);
    vxeUI.renderer.add('UserAvatar', UserAvatar);
    vxeUI.renderer.add('DictSelect', DictSelect);
    vxeUI.renderer.add('UserSelect', UserSelect);
    vxeUI.renderer.add('CellProgress', CellProgress);
  },
  useVbenForm,
});

export const useVbenVxeGrid = <T extends Record<string, any>>(
  ...rest: Parameters<typeof useGrid<T, ComponentType>>
) => useGrid<T, ComponentType>(...rest);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;

export type * from '@vben/plugins/vxe-table';
