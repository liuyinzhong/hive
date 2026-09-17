import { h } from 'vue';

import { Button } from 'antdv-next';
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props, events } = renderOpts;
    const { column, row } = params;
    const fieldText = row[column.field];
    const text = props?.text || (Array.isArray(fieldText) ? fieldText.join('、') : fieldText);
    return h(
      Button,
      {
        size: 'small',
        type: 'link',
        onClick: () => {
          events?.click?.(row);
        },
      },
      { default: () => text },
    );
  },
};
