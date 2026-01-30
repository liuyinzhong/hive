<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { getLocalDictList } from '#/dicts';

defineOptions({
  name: 'BugNextModal',
});

const params = ref<any>({});

const dictList = getLocalDictList('BUG_STATUS');
const current = ref(0);

const [Modal, modalApi] = useVbenModal({
  title: '流转缺陷',
  onConfirm: async () => {
    onSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const obj = modalApi.getData();
      params.value = {
        /* changeRichText: obj.changeRichText || "",
        fkId: obj.id,
        fkType: 'bug',
        behaviorType:"0",
        extendJson:JSON.stringify(obj) */
        id: obj.id,
        bugStatus: 10,
      };
    }
  },
});

function onSubmit() {
  message.loading({
    content: '正在提交中...',
    duration: 0,
    key: 'is-form-submitting',
  });
  modalApi.lock();
  setTimeout(() => {
    modalApi.close();
    message.success({
      content: `提交成功：${JSON.stringify(params.value)}`,
      duration: 2,
      key: 'is-form-submitting',
    });
  }, 3000);
}
</script>
<template>
  <Modal class="w-[600px]">
    <!-- <div>默认当前缺陷状态的下一个阶段</div> -->
    <a-row :gutter="24">
      <a-col :span="12">
        <a-steps
          v-model:current="current"
          direction="vertical"
          :items="
            dictList.map((item) => ({
              title: item.label,
              description: item.remark,
            }))
          "
        />
      </a-col>
      <a-col :span="12">
        <a-form
          :model="params"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
        >
          <a-form-item label="备注" prop="remark">
            <a-input v-model="params.remark" />
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </Modal>
</template>
