<script lang="ts" setup>
import { reactive, computed, markRaw } from 'vue'
import SubViewLayout from '@/layout/SubViewLayout.vue'
import { useUserStore } from '@/store'
import { PeoplesTwo, ChartGraph, Peoples, People, Remind } from '@icon-park/vue-next'
import MobilePageHeader from '@/components/mobile/MobilePageHeader.vue'
import { useMobile } from '@/hooks/useMobile'

const userStore = useUserStore()
const { isMobile } = useMobile()

const menus = reactive([
  {
    name: '好友通知',
    path: '/contact/friend/apply',
    icon: markRaw(Remind),
    tips: computed(() => (userStore.isContactApply ? 'New' : ''))
  },
  {
    name: '群聊通知',
    path: '/contact/group/apply',
    icon: markRaw(Remind),
    tips: computed(() => (userStore.isGroupApply ? 'New' : ''))
  },
  {
    name: '我的好友',
    path: '/contact/friend',
    icon: markRaw(People)
  },
  {
    name: '我的群聊',
    path: '/contact/group',
    icon: markRaw(Peoples)
  },
  {
    name: '公开群聊',
    path: '/contact/open-group',
    icon: markRaw(PeoplesTwo)
  },
  {
    name: '组织架构',
    path: '/contact/organize',
    icon: markRaw(ChartGraph),
    show: computed(() => userStore.isQiye)
  }
])
</script>

<template>
  <!-- 移动端显示 -->
  <template v-if="isMobile">
    <MobilePageHeader title="通讯录" />
    <div class="contact-mobile-container">
      <SubViewLayout title="通讯录" :menus="menus" />
    </div>
  </template>

  <!-- PC端显示 -->
  <SubViewLayout v-else title="通讯录" :menus="menus" />
</template>

<style lang="less" scoped>
.contact-mobile-container {
  height: 100%;
  overflow: hidden;
  padding-top: 50px; // 为顶部的MobilePageHeader预留空间
  box-sizing: border-box;
}

.contact-mobile-container :deep(.section) {
  height: 100%;
}

.contact-mobile-container :deep(.section .el-header) {
  display: none;
}

.contact-mobile-container :deep(.section .el-container) {
  height: 100%;
  overflow: hidden;
}

.contact-mobile-container :deep(.section .el-aside) {
  width: 100% !important;
  border-right: none;
  padding: 10px;
  overflow-y: auto;
}

.contact-mobile-container :deep(.section .el-aside .menu) {
  height: 50px;
  margin: 5px 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 0 15px;
}

.contact-mobile-container :deep(.section .el-aside .menu .icon) {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background-color: #07c160;
  color: #fff;
}

.contact-mobile-container :deep(.section .el-aside .menu .name) {
  font-size: 15px;
  color: #333;
  padding-left: 10px;
}

.contact-mobile-container :deep(.section .el-aside .menu .tips .badge) {
  background-color: #ff4d4f;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.contact-mobile-container :deep(.section .el-aside .menu:hover),
.contact-mobile-container :deep(.section .el-aside .menu.selectd) {
  background-color: #e8f5e9;
}

.contact-mobile-container :deep(.section .el-main) {
  display: block;
  height: calc(100% - 50px - 10px);
  overflow: hidden;
  margin-top: 10px;
}

html[theme-mode='dark'] {
  .contact-mobile-container :deep(.section .el-aside .menu) {
    background-color: #2a2a2a;
  }

  .contact-mobile-container :deep(.section .el-aside .menu .name) {
    color: #e0e0e0;
  }

  .contact-mobile-container :deep(.section .el-aside .menu:hover),
  .contact-mobile-container :deep(.section .el-aside .menu.selectd) {
    background-color: #1a5f2e;
  }
}
</style>
