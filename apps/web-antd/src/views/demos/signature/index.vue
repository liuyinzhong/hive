<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Space } from 'ant-design-vue';
import SignaturePad from 'signature_pad';

// 签名板实例
const signaturePad = ref<null | SignaturePad>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const imageUrl = ref(''); // 生成的签名图片URL

// 初始化签名板
onMounted(() => {
  if (canvasRef.value) {
    signaturePad.value = new SignaturePad(canvasRef.value, {
      backgroundColor: 'rgb(255, 255, 255)', // 背景白色
      penColor: 'rgb(0, 0, 0)', // 笔触黑色
    });
  }
});

// 生成签名（基于文本）
const generateSignature = () => {
  if (!canvasRef.value || !signaturePad.value) {
    message.error('签名板未初始化');
    return;
  }
  // 导出图片
  imageUrl.value = signaturePad.value.toDataURL();
};

// 清除签名
const clearSignature = () => {
  if (signaturePad.value) {
    signaturePad.value.clear();
    imageUrl.value = '';
  }
};
</script>
<template>
  <Page description="签名测试" title="使用演示">
    <!-- 签名画布 -->
    <canvas
      ref="canvasRef"
      width="400"
      height="200"
      style="margin: 10px 0; border: 1px solid #ddd"
    ></canvas>

    <Space wrap>
      <!-- 操作按钮 -->
      <Button type="primary" @click="generateSignature">生成签名</Button>
      <Button @click="clearSignature">清除</Button>
    </Space>

    <!-- 生成的签名图片 -->
    <div v-if="imageUrl" style="margin-top: 20px">
      <h3>生成的签名：</h3>
      <img :src="imageUrl" alt="签名图片" style="border: 1px solid #eee" />
    </div>
  </Page>
</template>
