import { Tag, Tooltip, TypographyText } from 'ant-design-vue';
import { getLocalDictText, getLocalDictColor } from '#/dicts';

import { h } from 'vue';
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props } = renderOpts;
    const { column, row } = params;

    let field = column.field;
    if (props.mode === 'multiple') {
      return h('div', {}, { default: () => (row[field] || []).length });
    } else {
      let text = getLocalDictText(props.type, row[field]);
      let color = getLocalDictColor(props.type, row[field]);
      return h(
        Tag,
        {
          color,
        },
        { default: () => text },
      );
    }
  },
};
