<script lang="ts" setup>
import SubViewLayout from '@/layout/SubViewLayout.vue'
import { Tool, Protect, Remind, LinkThree, User } from '@icon-park/vue-next'
import MobilePageHeader from '@/components/mobile/MobilePageHeader.vue'
import { useMobile } from '@/hooks/useMobile'

const menus = [
  {
    name: '个人中心',
    path: '/settings/detail',
    icon: User
  },
  {
    name: '安全设置',
    path: '/settings/security',
    icon: Protect
  },
  {
    name: '个性设置',
    path: '/settings/personalize',
    icon: Tool
  },
  {
    name: '绑定设置',
    path: '/settings/binding',
    icon: LinkThree
  },
  {
    name: '通知设置',
    path: '/settings/notification',
    icon: Remind
  }
]

const { isMobile } = useMobile()
</script>

<template>
  <!-- 移动端显示 -->
  <template v-if="isMobile">
    <MobilePageHeader title="设置" />
    <div class="setting-mobile-container">
      <SubViewLayout title="" :menus="menus" />
    </div>
  </template>

  <!-- PC端显示 -->
  <SubViewLayout v-else title="我的设置" :menus="menus" />
</template>

<style lang="less" scoped>
.setting-mobile-container {
  height: 100%;
  overflow: hidden;
}

.setting-mobile-container :deep(.section) {
  height: 100%;
}

.setting-mobile-container :deep(.section .el-header) {
  display: none;
}

.setting-mobile-container :deep(.section .el-container) {
  height: 100%;
  overflow: hidden;
}

.setting-mobile-container :deep(.section .el-aside) {
  width: 100% !important;
  border-right: none;
  padding: 10px;
  overflow-y: auto;
}

.setting-mobile-container :deep(.section .el-aside .menu) {
  height: 50px;
  margin: 5px 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 0 15px;
}

.setting-mobile-container :deep(.section .el-aside .menu .icon) {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background-color: #07c160;
  color: #fff;
}

.setting-mobile-container :deep(.section .el-aside .menu .name) {
  font-size: 15px;
  color: #333;
  padding-left: 10px;
}

.setting-mobile-container :deep(.section .el-aside .menu:hover),
.setting-mobile-container :deep(.section .el-aside .menu.selectd) {
  background-color: #e8f5e9;
}

.setting-mobile-container :deep(.section .el-main) {
  display: none;
}

html[theme-mode='dark'] {
  .setting-mobile-container :deep(.section .el-aside .menu) {
    background-color: #2a2a2a;
  }

  .setting-mobile-container :deep(.section .el-aside .menu .name) {
    color: #e0e0e0;
  }

  .setting-mobile-container :deep(.section .el-aside .menu:hover),
  .setting-mobile-container :deep(.section .el-aside .menu.selectd) {
    background-color: #1a5f2e;
  }
}
</style>
