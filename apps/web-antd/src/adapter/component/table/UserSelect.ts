import { AvatarGroup, Avatar, Select, SelectOption } from 'ant-design-vue';
import { h } from 'vue';

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row, cell } = params;
    const { props, events } = _renderOpts;
    debugger;
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

    return h(
      Select,
      {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        defaultOpen: true,
        maxTagCount: 0,
        mode: 'multiple',
        style: {
          width: '100%',
        },
        value:
          row[column.field]?.map((item: any) => item[props.valueField]) || [],
        // 关键：将下拉菜单挂载到当前单元格元素内
        getPopupContainer: () => {
          // cell.$el 是当前编辑单元格的 DOM 元素
          return params.$table.getCellElement(row, column.field);
        },
        // 补充：阻止下拉菜单的事件冒泡（避免被表格捕获）
        onPopupScroll: (e: Event) => {
          e.stopPropagation();
        },
        onChange: (value: any) => {
          debugger;
          // row[column.valueField] = value;
        },
        change: (value: any) => {
          debugger;
        },
      },
      // 构造选项列表
      options.map((item: any) =>
        h(
          SelectOption,
          {
            value: item[props.valueField],
          },
          // 选项内部内容：头像和用户名
          () =>
            h('div', { class: 'flex items-center' }, [
              h(
                Avatar,
                {
                  src: item[props.avatarField] || undefined,
                  size: 'small',
                },
                () => item[props.labelField].charAt(0),
              ),
              h(
                'span',
                { style: { marginLeft: '5px' } },
                item[props.labelField],
              ),
            ]),
        ),
      ),
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;
    const userList = row?.[column.field] || [];

    const avatars = userList.map((item: any, index: any) => {
      return h(
        Avatar,
        {
          key: index,
          src: item[props.avatarField] || undefined,
          style: { backgroundColor: '#f56a00' },
        },
        {
          default: () => item[props.labelField].charAt(0), // 默认插槽内容
        },
      );
    });

    return h(AvatarGroup, {}, { default: () => avatars });
  },
};
