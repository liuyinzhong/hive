import { h } from 'vue';

import { ApiComponent } from '@vben/common-ui';

import { message, Select } from 'antdv-next';

import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import UserAvatar from '#/adapter/component/table/UserAvatar';

import { getProjectUsersApi } from '#/api/dev';
import UserAvatarComponent from '#/components/UserAvatar/index.vue';

/*
仅支持两种格式，
多人参与 所绑定的数据格式为：[{ userId: '', realName: '', avatar: '' }]

//这条数据里必需包含userId、realName、avatar三个字段
单人参与 所绑定的数据格式为：{ userId: '', realName: '', avatar: '' }

多人时请看 需求管理-参与人员列
单人时请看 任务管理-执行人列

*/

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;
    const rawValue = row?.[column.field];

    // 初始化值：多人为数组，单人为字符串
    let _value: any = props.multiple
      ? rawValue || []
      : row[props.userIdField || 'userId'] || undefined;

    return h(
      'div',
      {
        style: {},
        onwheel: (e: WheelEvent) => {
          e.stopPropagation(); // 阻止滚轮事件向上冒泡
        },
      },
      h(ApiComponent, {
        ...props,
        api: async () => {
          if (!row.projectId) {
            message.error('未关联项目');
            return [];
          }
          return await getProjectUsersApi(row.projectId || '');
        },
        labelField: 'realName',
        valueField: 'userId',
        optionFilterProp: 'label',
        component: Select,
        allowClear: true,
        filterOption: true,
        showSearch: true,
        defaultOpen: true,
        popupMatchSelectWidth: false,
        style: {
          width: '100%',
        },
        modelValue: _value,
        modelPropName: 'value',
        // 关键：将下拉菜单挂载到当前单元格元素内
        getPopupContainer: (e: HTMLElement) => {
          return e.parentNode as HTMLElement;
        },
        onOpenChange(_visible: boolean) {
          events.change(_value, row);
        },
        onChange: (value: any) => {
          _value = value;
        },
        // 使用 optionRender prop 自定义选项渲染（antdv-next Select 不支持 option slot）
        optionRender: ({ option }: any) => {
          return h(UserAvatarComponent, {
            avatar: option.data?.avatar || '',
            name: option.label || '',
          });
        },
      }),
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    const { props } = _renderOpts;
    if (props.multiple) {
      return UserAvatarGroup.renderTableDefault(_renderOpts, params);
    }
    return UserAvatar.renderTableDefault(_renderOpts, params);
  },
};
