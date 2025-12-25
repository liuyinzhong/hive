import { Button } from 'ant-design-vue';
import { h } from 'vue';
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props, events } = renderOpts;
    const { column, row } = params;
    let text = '';
    if (props?.text) {
      text = props?.text;
    } else {
      text = row[column.field];
    }
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
