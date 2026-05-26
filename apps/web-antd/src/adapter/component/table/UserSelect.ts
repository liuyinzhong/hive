import type { SystemUserApi } from '#/api/system';

import { h } from 'vue';

import { ApiComponent } from '@vben/common-ui';

import { Select } from 'ant-design-vue';

import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import { getUserListAllApi } from '#/api/system';
import UserAvatar from '#/components/UserAvatar/index.vue';

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
    let _list: any[] = row?.[column.field];
    if (!_list) {
      _list = [
        {
          userId: row?.userId || '',
          realName: row?.realName || '',
          avatar: row?.avatar || '',
        },
      ];
    }

    const userIds =
      _list.map((item: SystemUserApi.SystemUserFace) => item.userId) || [];

    // 初始化值
    let _value: any = userIds || [];

    return h(
      'div',
      {
        style: {},
        onwheel: (e: WheelEvent) => {
          e.stopPropagation(); // 阻止滚轮事件向上冒泡
        },
      },
      h(
        ApiComponent,
        {
          ...props,
          api: getUserListAllApi,
          labelField: 'realName',
          valueField: 'userId',
          optionFilterProp: 'label',
          component: Select,
          allowClear: true,
          filterOption: true,
          showSearch: true,
          defaultOpen: true,
          dropdownMatchSelectWidth: false,
          maxTagCount: 0,
          style: {
            width: '100%',
          },
          modelValue: userIds || [],
          modelPropName: 'value',
          // 关键：将下拉菜单挂载到当前单元格元素内
          getPopupContainer: (e: HTMLElement) => {
            return e.parentNode as HTMLElement;
          },
          onDropdownVisibleChange(visible: boolean) {
            events.change(_value, row);
          },
          onChange: (value: any) => {
            _value = value;
          },
        },
        {
          option: (optionItem: any) => {
            return h(UserAvatar, {
              avatar: optionItem.avatar || '',
              name: optionItem.label || '',
            });
          },
        },
      ),
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    return UserAvatarGroup.renderTableDefault(_renderOpts, params);
  },
};
