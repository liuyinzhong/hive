import { Avatar, Select, SelectOption } from 'ant-design-vue';
import { h, ref } from 'vue';
import { getUserListAll, type SystemUserApi } from '#/api/system';

import UserAvatarGroup from './UserAvatarGroup';

// 使用 ref 来存储用户列表数据
const userListRef = ref<SystemUserApi.SystemUser[]>([]);

// 加载用户列表数据的函数
async function loadUserList() {
  try {
    const data = await getUserListAll();
    userListRef.value = data || [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }
}

// 立即调用加载函数，确保在渲染前开始加载数据
loadUserList();

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;
    const userIds =
      row?.[column.field].map(
        (item: SystemUserApi.SystemUser) => item.userId,
      ) || [];

    return h(
      'div',
      {
        style: {},
        onwheel: (e: WheelEvent) => {
          e.stopPropagation(); // 阻止滚轮事件向上冒泡
        },
      },
      h(
        Select,
        {
          ...props,
          allowClear: true,
          filterOption: (input: string, option: any) => {
            return (
              option.realName.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          },
          showSearch: true,
          defaultOpen: true,
          dropdownMatchSelectWidth: false,
          maxTagCount: 0,
          style: {
            width: '100%',
          },
          value: userIds || [],
          // 关键：将下拉菜单挂载到当前单元格元素内
          getPopupContainer: (e) => {
            return e.parentNode;
          },
          onChange: (value: any) => {
            row[column.field] = userListRef.value.filter((item) =>
              value.includes(item.userId),
            );
            events.change(value);
          },
        },
        // 构造选项列表
        userListRef.value.map((item: SystemUserApi.SystemUser) =>
          h(
            SelectOption,
            {
              value: item.userId,
              key: item.userId,
              realName: item.realName,
              avatar: item.avatar,
              userId: item.userId,
            },
            // 选项内部内容：头像和用户名
            () =>
              h('div', { class: 'flex items-center' }, [
                h(
                  Avatar,
                  {
                    src: item.avatar || undefined,
                    size: 'small',
                  },
                  () => item.realName.charAt(0),
                ),
                h('span', { style: { marginLeft: '5px' } }, item.realName),
              ]),
          ),
        ),
      ),
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    return UserAvatarGroup.renderTableDefault(_renderOpts, params);
  },
};
