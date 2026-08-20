import type { FormValues, TableActionProps } from '@vben/common-ui';
import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';
import type { ComponentPropsMap, ComponentType } from './component';
import { defineComponent, h } from 'vue';
import { VbenTableAction as VbenTableActionCore } from '@vben/common-ui';
import {
  setupVbenVxeTable,
  useVbenVxeGrid as useGrid,
} from '@vben/plugins/vxe-table';
import { useAccess } from '@vben/access';

import CellDate from '#/adapter/component/table/CellDate';
import CellImage from '#/adapter/component/table/CellImage';
import CellLink from '#/adapter/component/table/CellLink';
import CellProgress from '#/adapter/component/table/CellProgress';
import DictSelect from '#/adapter/component/table/DictSelect';
import DictTag from '#/adapter/component/table/DictTag';
import UserAvatar from '#/adapter/component/table/UserAvatar';
import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';

import CellOperation from './component/table/CellOperation';
import CellSwitch from './component/table/CellSwitch';
import CellTag from './component/table/CellTag';
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
        rowConfig: {
          isHover: true,
          isCurrent: true,
        },
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        exportConfig: {
          excludeFields: ['operation'],
          remote: true,
          type: 'xlsx',
          types: ['xlsx'],
          mode: 'all',
          modes: ['all'],
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

    // 表格配置项可以用 cellRender: { name: 'CellDate' },
    vxeUI.renderer.add('CellDate', CellDate);

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

export const useVbenVxeGrid = <
  T extends Record<string, any>,
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
>(
  ...rest: Parameters<
    typeof useGrid<
      T,
      ComponentType,
      ComponentPropsMap,
      TFormValues,
      TSubmitValues
    >
  >
) =>
  useGrid<T, ComponentType, ComponentPropsMap, TFormValues, TSubmitValues>(
    ...rest,
  );

/**
 * 表格操作按钮组件
 *
 * 在适配器内部统一注入权限判断（hasPermission），使用方无需再传入 `:has-permission`。
 * 通过 action 的 `auth` 字段声明权限码，结合 `useAccess().hasAccessByCodes` 判断是否展示。
 * 如需自定义权限逻辑，仍可显式传入 `:has-permission` 覆盖默认行为。
 */
export const VbenTableAction = defineComponent(
  (props: TableActionProps, { attrs, slots }) => {
    const { hasAccessByCodes } = useAccess();
    function hasPermission(auth?: string | string[]) {
      if (!auth) return true;
      return hasAccessByCodes(Array.isArray(auth) ? auth : [auth]);
    }
    return () =>
      h(VbenTableActionCore, { hasPermission, ...props, ...attrs }, slots);
  },
  {
    name: 'VbenTableAction',
    inheritAttrs: false,
  },
);

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;

export type * from '@vben/plugins/vxe-table';
