<script lang="ts" setup>
import { h, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Row, Col, Steps, Divider } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import CommonPhrase from '#/components/CommonPhrase/index.vue';
import { getLocalDictList } from '#/dicts';
import { nextStoryApi } from '#/api/dev/story';

import { useNextFormSchema } from './data';
defineOptions({
  name: 'StoryNextModal',
});
const emit = defineEmits<{
  success: [];
}>();
const stepsItems: any = getLocalDictList('STORY_STATUS').map((item: any) => ({
  title: item.label,
  description: item.remark,
  value: item.value,
}));
const current = ref(0);
const changeCurrent = (index: number) => {
  current.value = index;
  formApi.setFieldValue('storyStatus', stepsItems[index].value);
};

/**
 * 按负责状态分组参与人,并把负责人姓名写入步骤条描述
 * @param userList 需求参与人列表,storyStatus 为负责状态(null=普通参与人)
 */
function applyStatusOwners(userList: any[]) {
  const ownersByStatus = new Map<string, string[]>();
  for (const user of userList || []) {
    if (user.storyStatus == null || !user.realName) continue;
    const names = ownersByStatus.get(String(user.storyStatus)) ?? [];
    names.push(user.realName);
    ownersByStatus.set(String(user.storyStatus), names);
  }
  stepsItems.forEach((item: any) => {
    const owners = ownersByStatus.get(String(item.value));
    item.description = h('div', [
      ...(owners?.length ? [h('div', `负责人：${owners.join('、')}`)] : []),
    ]);
  });
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: useNextFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '流转需求',
  onConfirm: async () => {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();

      formApi.setValues(data);

      /* 在步骤条上展示各状态负责人 */
      applyStatusOwners((data as any)?.userList);

      /* 设置当前步骤 */
      current.value = stepsItems.findIndex(
        (item: any) => item.value === data.storyStatus,
      );

      /* 禁用已完成的步骤 */
      stepsItems.forEach((item: any, index: number) => {
        item.disabled = index < current.value;
      });
    }
  },
});

async function onSubmit(values: Record<string, any>) {
  const hideLoading = message.loading({
    content: '正在流转中...',
    duration: 0,
  });
  modalApi.lock();
  try {
    await nextStoryApi(values.storyId, values);
    message.success('流转成功');
    modalApi.close();
    emit('success');
  } catch {
  } finally {
    hideLoading();
    modalApi.unlock();
  }
}

function setChangeRichText(value: string) {
  formApi.setFieldValue('changeRichText', value);
}
</script>
<template>
  <Modal class="w-[1000px]">
    <Row :gutter="24">
      <Col :span="6">
        <Steps
          v-model:current="current"
          orientation="vertical"
          @change="changeCurrent"
          :items="stepsItems"
        />
        <Divider dashed>常用语(双击)</Divider>
        <CommonPhrase
          :text-list="[
            '已更新至测试环境',
            '需求开发完成，转由测试验证，已更新至测试环境',
            '测试通过，转由产品验收',
            '产品验收通过，转由业务验收',
            '业务验收通过，可安排发版',
          ]"
          @dbl-click="setChangeRichText"
        />
      </Col>
      <Col :span="18">
        <Form />
      </Col>
    </Row>
  </Modal>
</template>
<style></style>
