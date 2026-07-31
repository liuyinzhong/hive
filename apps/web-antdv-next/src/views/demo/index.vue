<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DevBugApi } from '#/api/dev';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getBugListApi, deleteBugApi, updateBugFieldApi } from '#/api/dev/bug';
import { formatSorts } from '#/utils';
</script>

<template>
  <Page auto-content-height> </Page>
</template>
