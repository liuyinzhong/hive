<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenModal, VbenButton } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';
import { confirmBugApi } from '#/api/dev/bug';
import { message } from 'ant-design-vue';
defineOptions({
  name: 'BugConfirmModal',
});
const emit = defineEmits<{
  success: [];
}>();

const formData: any = ref({
  changeRichText: '',
});

const [Modal, modalApi] = useVbenModal({
  title: '确认缺陷',
  confirmText: '非BUG',
  overlayBlur: 5,
  onConfirm: async () => {
    onSubmit('2');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data: any = modalApi.getData();
      formData.value = data;
    }
  },
});

async function onSubmit(bugConfirmStatus: string) {
  const hideLoading = message.loading({
    content: '正在确认中...',
    duration: 0,
  });
  modalApi.lock();
  try {
    await confirmBugApi(formData.value.bugId, {
      bugConfirmStatus,
      changeRichText: formData.value.changeRichText,
    });
    message.success('确认成功');
    modalApi.close();
    emit('success');
  } finally {
    hideLoading();
    modalApi.unlock();
  }
}
// #endregion
</script>
<template>
  <Modal class="w-[800px]">
    <template #append-footer>
      <VbenButton variant="destructive" size="sm" @click="onSubmit('1')"
        >是BUG
      </VbenButton>
    </template>
    <VbenTiptap v-model="formData.changeRichText" placeholder="请输入" />
  </Modal>
</template>
