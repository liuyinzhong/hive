import { AvatarGroup, Avatar, Tooltip } from 'ant-design-vue';
import { h } from 'vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;
    const { props = {} } = renderOpts || {};
    const userList = row?.userList || [];
    const avatars = userList.map((item: any, index: any) => {
      return h(
        Tooltip,
        {
          key: index,
          title: item.realName,
        },
        {
          default: () =>
            h(
              Avatar,
              {
                src: item.avatar || undefined,
                style: { backgroundColor: '#ccc' },
                onClick: () => {
                  // debugger;
                },
              },
              {
                default: () => item.realName?.charAt(0), // 默认插槽内容
              },
            ),
        },
      );
    });

    return h(
      AvatarGroup,
      {
        ...props,
        maxCount: 3,
        // 超过maxCount的头像显示的样式 背景为当前主题的颜色
        maxStyle: { color: '#f56a00', backgroundColor: '#fde3cf' },
      },
      { default: () => avatars },
    );
  },
};
