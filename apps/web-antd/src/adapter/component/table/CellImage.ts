import { Image } from 'ant-design-vue';
import { h } from 'vue';
export default {
  renderTableDefault(_renderOpts: any, params: any) {
    const { column, row } = params;
    return h(Image, { src: row[column.field] });
  },
};
