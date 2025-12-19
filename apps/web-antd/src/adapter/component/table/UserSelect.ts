import { AvatarGroup, Avatar, Select, SelectOption } from 'ant-design-vue';
import { h } from 'vue';
let options = [
  {
    avatar: 'https://picsum.photos/30/30',
    realName: '张三',
    userId: '001',
  },
  {
    avatar: 'https://picsum.photos/30/30',
    realName: '李四',
    userId: '002',
  },
  {
    avatar: 'https://picsum.photos/30/30',
    realName: '王五',
    userId: '003',
  },
];

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;

    return h(
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
        value: row[column.field] || [],
        // 关键：将下拉菜单挂载到当前单元格元素内
        getPopupContainer: () => {
          // cell.$el 是当前编辑单元格的 DOM 元素
          return params.$table.getCellElement(row, column.field);
          // return document.body;
        },
        onChange: (value: any) => {
          debugger;
          row[column.field] = value;
          events.change(value);
        },
      },
      // 构造选项列表
      options.map((item: any) =>
        h(
          SelectOption,
          {
            value: item.userId,
            key: item.userId,
            realName: item.realName,
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
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    const { column, row } = params;
    // const { props, events } = _renderOpts;
    const userIds = row?.[column.field] || [];

    const userList = options.filter((item: any) =>
      userIds.includes(item.userId),
    );

    const avatars = userList.map((item: any, index: any) => {
      return h(
        Avatar,
        {
          key: index,
          src: item.avatar || undefined,
          style: { backgroundColor: '#f56a00' },
        },
        {
          default: () => item.realName.charAt(0), // 默认插槽内容
        },
      );
    });

    return h(AvatarGroup, {}, { default: () => avatars });
  },
};
