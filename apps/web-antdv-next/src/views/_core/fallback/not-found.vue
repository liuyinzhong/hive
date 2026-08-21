<script lang="ts" setup>
import { Fallback } from '@vben/common-ui';

defineOptions({ name: 'Fallback404Demo' });
</script>

<template>
  <Fallback status="404" :showBack="false" homePath="" />
</template>
