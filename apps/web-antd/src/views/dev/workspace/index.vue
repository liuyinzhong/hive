<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import StoryCard from './StoryCard.vue';
import TaskCard from './TaskCard.vue';
import BugCard from './BugCard.vue';
</script>

<template>
  <Page auto-content-height>
    <a-row :gutter="20">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12" :xxl="12">
        <StoryCard></StoryCard>
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12" :xxl="12">
        <TaskCard></TaskCard>
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12" :xxl="12">
        <BugCard></BugCard>
      </a-col>
    </a-row>
  </Page>
</template>
