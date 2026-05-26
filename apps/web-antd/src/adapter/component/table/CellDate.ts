import { h } from 'vue';

import { get } from '@vben/utils';

import { DatePicker } from 'ant-design-vue';

import dayjs from 'dayjs';

/**
 * 单元格日期选择组件
 * @description 用于在表格单元格中渲染日期选择器，支持日期选择和格式化显示
 * @param {Object} props - 组件属性，继承 antdv DatePicker 组件属性
 * @param {Object} attrs - 组件额外属性，包含事件回调等
 * @param {any} value - 单元格的值
 * @param {Object} row - 行数据
 * @param {Object} column - 列配置，用于获取单元格的字段名
 * @returns {VNode} - 渲染后的日期选择器节点
 *
 * 使用示例：
 * {
 *   field: 'startDate',
 *   title: '开始时间',
 *   editRender: {
 *     name: 'CellDate',
 *     props: {
 *       format: 'YYYY-MM-DD',
 *       valueFormat: 'YYYY-MM-DD',
 *     },
 *     events: {
 *       change: (val, row) => {
 *         console.log('日期变更:', val, row);
 *       },
 *     },
 *   },
 * }
 */

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;

    return h(
      'div',
      {
        style: {},
        onwheel: (e: WheelEvent) => {
          e.stopPropagation(); // 阻止滚轮事件向上冒泡
        },
      },
      h(DatePicker, {
        ...props,
        allowClear: true,
        format: props?.format || 'YYYY-MM-DD',
        placeholder: '请选择日期',
        valueFormat: props?.valueFormat || 'YYYY-MM-DD HH:mm:ss',
        open: true,
        style: {
          width: '100%',
        },
        value: dayjs(row[column.field]),
        // 关键：将下拉菜单挂载到当前单元格元素内
        getPopupContainer: (e: HTMLElement) => {
          return e?.parentNode as HTMLElement;
        },
        onChange: (newVal: any) => {
          if (events?.change) {
            if (column.field === 'startDate') {
              newVal = dayjs(newVal)
                .startOf('day')
                .format('YYYY-MM-DD HH:mm:ss');
            } else if (column.field === 'endDate') {
              newVal = dayjs(newVal).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            }

            events.change(newVal, row);
          }
          row[column.field] = newVal;
        },
      }),
    );
  },
  renderTableCell(_renderOpts: any, params: any) {
    const { column, row } = params;

    const value = get(row, column.field);

    return h('div', {}, dayjs(value).format('YYYY-MM-DD'));
    // return h('div', {}, value);
  },
};
