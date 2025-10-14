import { AvatarGroup, Avatar } from 'ant-design-vue';
import { h } from 'vue';

export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { column, row } = params;
    const userList = row?.userList || [];
    const avatars = userList.map((item: any, index: any) => {
      return h(
        Avatar,
        {
          key: index,
          style: { backgroundColor: '#f56a00' },
          onClick: () => {
            debugger;
          },
        },
        {
          default: () => item.userName, // 默认插槽内容
        },
      );
    });

    return h(AvatarGroup, {}, { default: () => avatars });
  },
};
