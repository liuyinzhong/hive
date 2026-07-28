import { h } from 'vue';

import { useAccess } from '@vben/access';

import { message, Modal, Switch } from 'antdv-next';

import { $t } from '#/locales';

import CellTag from './CellTag';

interface CellSwitchAttrs {
  auth?: string | string[];
  onChange?: (
    newStatus: 0 | 1,
    row: Record<string, any>,
  ) => PromiseLike<unknown> | unknown;
}

interface CellSwitchRenderOptions {
  attrs?: CellSwitchAttrs;
  props?: Record<string, any>;
}

/**
 * 通用表格状态开关，固定使用 0 表示禁用、1 表示启用。
 * 可通过 cellRender.attrs.auth 声明权限码，无权限时降级为 CellTag 展示。
 * 用户确认后调用 cellRender.attrs.onChange；接口成功后更新单元格并提示操作成功。
 * 接口失败提示由统一请求拦截器处理，单元格保持原状态。
 */
export default {
  renderTableDefault(
    { attrs, props }: CellSwitchRenderOptions,
    { column, row }: { column: { field: string }; row: Record<string, any> },
  ) {
    const auth = attrs?.auth;
    if (auth) {
      const { hasAccessByCodes } = useAccess();
      if (!hasAccessByCodes(Array.isArray(auth) ? auth : [auth])) {
        return CellTag.renderTableDefault({}, { column, row });
      }
    }

    const loadingKey = `__loading_${column.field}`;

    function confirmChange(newStatus: 0 | 1) {
      const statusText =
        newStatus === 1 ? $t('common.enabled') : $t('common.disabled');
      return new Promise<boolean>((resolve) => {
        Modal.confirm({
          content: $t('ui.actionMessage.statusChangeConfirm', [statusText]),
          onCancel: () => resolve(false),
          onOk: () => resolve(true),
        });
      });
    }

    async function handleChange(value: unknown) {
      const newStatus: 0 | 1 = value === 1 ? 1 : 0;
      if (!(await confirmChange(newStatus))) return;

      row[loadingKey] = true;
      try {
        await attrs?.onChange?.(newStatus, row);
        row[column.field] = newStatus;
        message.success($t('ui.actionMessage.operationSuccess'));
      } catch {
        // 接口错误提示由 requestClient 的统一错误拦截器处理。
      } finally {
        row[loadingKey] = false;
      }
    }

    return h(Switch, {
      ...props,
      checked: row[column.field],
      checkedChildren: $t('common.enabled'),
      checkedValue: 1,
      loading: row[loadingKey] ?? false,
      unCheckedChildren: $t('common.disabled'),
      unCheckedValue: 0,
      'onUpdate:checked': handleChange,
    });
  },
};
