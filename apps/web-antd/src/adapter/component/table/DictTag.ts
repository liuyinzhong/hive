import { _vNodeDictTag } from '#/dicts';

import { h } from 'vue';
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props } = renderOpts;
    const { column, row } = params;

    let field = column.field;
    if (props.mode === 'multiple') {
      return h('div', {}, { default: () => (row[field] || []).length });
    } else {
      return _vNodeDictTag(props.type, row[field]);
    }
  },
};
