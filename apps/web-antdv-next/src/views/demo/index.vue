<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { message, Button } from 'antdv-next';
function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>

<template>
  <Page auto-content-height>
    <Button type="primary" @click="onSubmit">打开提示</Button>
  </Page>
</template>
