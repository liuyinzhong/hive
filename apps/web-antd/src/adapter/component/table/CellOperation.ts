import { h } from 'vue';
import { $t } from '#/locales';
import type { Recordable } from '@vben/types';
import { isFunction, isString } from '@vben/utils';
import { $te } from '@vben/locales';
import { Button, Popconfirm } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

/**
 * 操作列组件
 * @param {Object} props - 组件属性
 * @param {Object} attrs - 组件属性
 * @param {Object} options - 操作项配置
 * @param {Object} row - 当前行数据
 * @param {Object} column - 当前列配置
 * @param {number} level - 操作行的层级，用于树表格
 * @returns {VNode} - 渲染后的操作列组件
 * @description 操作列组件用于渲染操作按钮，如编辑、删除等。
 *
 * 继承 antdv 的 Button 组件属性
 */

export default {
  renderTableDefault(
    { attrs, options, props }: any,
    {
      row,
      rowIndex,
      $rowIndex,
      column,
      columnIndex,
      $columnIndex,
      _columnIndex,
      $table,
      level,
    }: any,
  ) {
    const defaultProps = { size: 'small', type: 'link', ...props };
    let align = 'end';
    switch (column.align) {
      case 'center': {
        align = 'center';
        break;
      }
      case 'left': {
        align = 'start';
        break;
      }
      default: {
        align = 'end';
        break;
      }
    }
    const presets: Recordable<Recordable<any>> = {
      delete: {
        danger: true,
        text: $t('common.delete'),
      },
      edit: {
        text: $t('common.edit'),
      },
    };
    const operations: Array<Recordable<any>> = (options || ['edit', 'delete'])
      .map((opt: string | Recordable<any>) => {
        if (isString(opt)) {
          return presets[opt]
            ? { code: opt, ...presets[opt], ...defaultProps }
            : {
                code: opt,
                text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                ...defaultProps,
              };
        } else {
          return { ...defaultProps, ...presets[opt.code], ...opt };
        }
      })
      .map((opt: Recordable<any>) => {
        const optBtn: Recordable<any> = {};
        Object.keys(opt).forEach((key) => {
          optBtn[key] = isFunction(opt[key]) ? opt[key](row, level) : opt[key];
        });
        return optBtn;
      })
      .filter((opt: Recordable<any>) => opt.show !== false);

    function renderBtn(opt: Recordable<any>, listen = true) {
      return h(
        Button,
        {
          ...props,
          ...opt,
          icon: undefined,
          onClick: listen
            ? () =>
                attrs?.onClick?.({
                  code: opt.code,
                  row,
                })
            : undefined,
        },
        {
          default: () => {
            const content = [];
            if (opt.icon) {
              content.push(h(IconifyIcon, { class: 'size-5', icon: opt.icon }));
            }
            content.push(opt.text);
            return content;
          },
        },
      );
    }

    function renderConfirm(opt: Recordable<any>) {
      let viewportWrapper: HTMLElement | null = null;
      return h(
        Popconfirm,
        {
          /**
           * 当popconfirm用在固定列中时，将固定列作为弹窗的容器时可能会因为固定列较窄而无法容纳弹窗
           * 将表格主体区域作为弹窗容器时又会因为固定列的层级较高而遮挡弹窗
           * 将body或者表格视口区域作为弹窗容器时又会导致弹窗无法跟随表格滚动。
           * 鉴于以上各种情况，一种折中的解决方案是弹出层展示时，禁止操作表格的滚动条。
           * 这样既解决了弹窗的遮挡问题，又不至于让弹窗随着表格的滚动而跑出视口区域。
           */
          getPopupContainer(el) {
            viewportWrapper = el.closest('.vxe-table--viewport-wrapper');
            return document.body;
          },
          placement: 'topLeft',
          title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
          ...props,
          ...opt,
          icon: undefined,
          onOpenChange: (open: boolean) => {
            // 当弹窗打开时，禁止表格的滚动
            if (open) {
              viewportWrapper?.style.setProperty('pointer-events', 'none');
            } else {
              viewportWrapper?.style.removeProperty('pointer-events');
            }
          },
          onConfirm: () => {
            attrs?.onClick?.({
              code: opt.code,
              row,
            });
          },
        },
        {
          default: () => renderBtn({ ...opt }, false),
          description: () =>
            h(
              'div',
              { class: 'truncate' },
              $t('ui.actionMessage.deleteConfirm', [
                row[attrs?.nameField || 'name'],
              ]),
            ),
        },
      );
    }

    const btns = operations.map((opt) =>
      opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
    );
    return h(
      'div',
      {
        class: 'flex table-operations',
        style: { justifyContent: align },
      },
      btns,
    );
  },
};
