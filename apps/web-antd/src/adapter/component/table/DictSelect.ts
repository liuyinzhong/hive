import { Select } from 'ant-design-vue';
import { h } from 'vue';
import { getLocalDictList } from '#/dicts';

import DictTag from './DictTag';

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;

    let options = getLocalDictList(props.type);

    options = [...(props.before || []), ...options, ...(props.after || [])];

    return h(
      'div',
      {
        style: {},
        onwheel: (e: WheelEvent) => {
          e.stopPropagation(); // 阻止滚轮事件向上冒泡
        },
      },
      h(Select, {
        ...props,
        allowClear: true,
        filterOption: true,
        optionFilterProp: 'label',
        showSearch: true,
        defaultOpen: true,
        dropdownMatchSelectWidth: false,
        maxTagCount: 0,
        style: {
          width: '100%',
        },
        options,
        value: row[column.field],
        // 关键：将下拉菜单挂载到当前单元格元素内
        getPopupContainer: (e: HTMLElement) => {
          return e.parentNode as HTMLElement;
        },
        onChange: (value: any) => {
          row[column.field] = value;
          events.change(value, row);
        },
      }),
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    // 使用 DictTag 渲染标签
    return DictTag.renderTableDefault(_renderOpts, params);
  },
};
