import { Avatar, TypographyText, Space } from 'ant-design-vue';
import { h } from 'vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;

    let avatar = row[renderOpts.props.avatarField];
    let name = row[renderOpts.props.nameField];

    return h(Space, { size: 5 }, [
      h(Avatar, {
        src: avatar,
        size: 30,
        style: {
          maxWidth: '30px',
          maxHeight: '30px',
        },
      }),
      h(TypographyText, {
        ellipsis: { tooltip: true },
        content: name,
        style: { width: '60px' },
      }),
    ]);
  },
};
