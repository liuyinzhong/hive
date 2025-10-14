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
      options,
      value: row[column.field],
      onChange: (value: any) => {
        row[column.field] = value;
      },
    });
  },

  renderTableCell(_renderOpts: any, params: any) {
    // 使用 DictTag 渲染标签
    return DictTag.renderTableDefault(_renderOpts, params);
  },
};
