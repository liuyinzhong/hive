import { h } from 'vue';

import DictTag from '#/components/DictTag/index.vue';
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props } = renderOpts;
    const { column, row } = params;

    const field = column.field;
    return props.mode === 'multiple'
      ? h('div', {}, { default: () => (row[field] || []).length })
      : h(DictTag, { dictType: props.type, value: row[field] });
  },
};
