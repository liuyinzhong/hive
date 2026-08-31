import type { SystemUserApi } from '#/api/system';

import { h } from 'vue';

import { ApiComponent } from '@vben/common-ui';

import { message, Select } from 'antdv-next';

import UserAvatarGroup from '#/adapter/component/table/UserAvatarGroup';
import { getProjectUsersApi } from '#/api/dev';
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
    const rawValue = row?.[column.field];
    // 判断多人/单人场景：row[field] 为数组时为多人，否则为单人（从扁平字段 userId/realName/avatar 取值）
    const isMultiple = Array.isArray(rawValue);
    let _list: any[] = rawValue;
    if (!isMultiple) {
      _list = [
        {
          userId: row?.userId || '',
          realName: row?.realName || '',
          avatar: row?.avatar || '',
        },
      ];
    }

    const userIds = _list
      .map((item: SystemUserApi.SystemUserFace) => item.userId)
      .filter(Boolean);

    // 初始化值：多人为数组，单人为字符串
    let _value: any = isMultiple ? userIds : userIds[0] || undefined;

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
        // 仅多人场景启用多选与标签折叠
        ...(isMultiple ? { mode: 'multiple', maxTagCount: 0 } : {}),
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
          return h(UserAvatar, {
            avatar: option.data?.avatar || '',
            name: option.label || '',
          });
        },
      }),
    );
  },

  renderTableCell(_renderOpts: any, params: any) {
    return UserAvatarGroup.renderTableDefault(_renderOpts, params);
  },
};
