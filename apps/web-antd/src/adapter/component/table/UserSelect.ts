import { Select } from 'ant-design-vue';
import { h } from 'vue';
import { getUserListAll, type SystemUserApi } from '#/api/system';
import { ApiComponent } from '@vben/common-ui';
import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import UserAvatar from '#/components/UserAvatar/index.vue';

export default {
  renderTableEdit(_renderOpts: any, params: any) {
    const { column, row } = params;
    const { props, events } = _renderOpts;
    const userIds =
      row?.[column.field].map(
        (item: SystemUserApi.SystemUserFace) => item.userId,
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
        ApiComponent,
        {
          ...props,
          api: getUserListAll,
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
          onChange: (value: any) => {
            events.change(value, row);
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
