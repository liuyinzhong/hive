import type { SystemUserApi } from '#/api/system';

import { h } from 'vue';

import { ApiComponent } from '@vben/common-ui';

import { Select } from 'ant-design-vue';

import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import { getUserListAllApi } from '#/api/system';
import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;
    const userIds =
      row?.[column.field].map(
        (item: SystemUserApi.SystemUserFace) => item.userId,
      ) || [];

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
