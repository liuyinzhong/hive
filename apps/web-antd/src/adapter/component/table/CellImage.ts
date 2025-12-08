import { h } from 'vue';

import { Image } from 'ant-design-vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { props } = renderOpts;
    const { column, row } = params;
    return h(Image, { src: row[column.field], ...props });
  },
};
