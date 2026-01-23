import { Select } from 'ant-design-vue';
import { h } from 'vue';
import { getDictList } from '#/dicts';

import DictTag from './DictTag';

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;

    let options = getDictList(props.type);

    options = [...(props.before || []), ...options, ...(props.after || [])];

    return h(Select, {
      ...props,
      allowClear: true,
      optionFilterProp: 'label',
      filterOption: true,
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
      getPopupContainer: () => {
        // cell.$el 是当前编辑单元格的 DOM 元素
        return params.$table.getCellElement(row, column.field);
        // return document.body;
      },
      onChange: (value: any) => {
        row[column.field] = value;
        events.change(value, row);
      },
    });
  },

  renderTableCell(_renderOpts: any, params: any) {
    // 使用 DictTag 渲染标签
    return DictTag.renderTableDefault(_renderOpts, params);
  },
};
