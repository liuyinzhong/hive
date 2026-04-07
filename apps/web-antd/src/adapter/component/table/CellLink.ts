import { h } from 'vue';

import { Button } from 'ant-design-vue';
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props, events } = renderOpts;
    const { column, row } = params;
    const text = props?.text || row[column.field];
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
