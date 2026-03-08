<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDialogueStore } from '@/store'
import Menu from './component/Menu.vue'
import MobileTabBar from './component/MobileTabBar.vue'
//import { isElectronMode } from '@/utils/electron'

//const isElectron = isElectronMode()
import { useMobile } from '@/hooks/useMobile'

const { isMobile } = useMobile()
const route = useRoute()
const dialogueStore = useDialogueStore()

// 判断是否在聊天界面（有选中会话时）
const isChatPage = computed(() => {
  return route.path === '/message' && dialogueStore.index_name
})

// 移动端且不在聊天界面时显示TabBar
const showTabBar = computed(() => isMobile.value && !isChatPage.value)
</script>

<template>
  <!-- 移动端: 底部TabBar（放在容器外部，避免被overflow: hidden裁剪） -->
  <MobileTabBar v-if="showTabBar" class="global-tabbar" />

  <section class="el-container is-vertical im-container">
    <!--
    <header v-if="isElectron" class="el-header app-header flex-center app-drag">
      LumenIM 在线聊天
    </header>
    -->
    <main class="el-main">
      <section class="el-container">
        <!-- PC端: 左侧菜单栏 -->
        <aside v-if="!isMobile" class="el-aside"><Menu></Menu></aside>

        <!-- 内容区域 -->
        <main class="el-main" :class="{ 'mobile-main': isMobile }">
          <router-view />
        </main>
      </section>
    </main>
  </section>
</template>
<style lang="less" scoped>
.im-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #ffffff;

  .app-header {
    height: 28px;
    background-color: #1890ff;
    color: #ffffff;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }

  .el-aside {
    width: 60px;
    box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  }

  .mobile-main {
    padding-bottom: 60px; // 为底部TabBar留出空间
  }

  // 移动端适配
  @media screen and (max-width: 768px) {
    .el-main {
      .el-main {
        padding-bottom: 60px;
      }
    }
  }
}

html[theme-mode='dark'] {
  .im-container {
    background-color: unset;

    .app-header {
      background-color: #383838;
      color: #9d9696;
    }

    .el-aside {
      background-color: rgba(255, 255, 255, 0.05);
      box-shadow: unset;
    }
  }
}
</style>
