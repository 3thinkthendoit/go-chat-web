<script lang="ts" setup>
import { onUnmounted, computed, onMounted } from 'vue'
import { useDialogueStore } from '@/store'
import Panel from './panel/Index.vue'
import Sider from './sider/Index.vue'
import Amicable from './amicable.vue'
import { useRouter } from 'vue-router'
import MobilePageHeader from '@/components/mobile/MobilePageHeader.vue'
import { useMobile } from '@/hooks/useMobile'

const dialogueStore = useDialogueStore()
const router = useRouter()
const { isMobile } = useMobile()
const indexName = computed(() => dialogueStore.index_name)

// 在移动端切换会话
const onTabTalkMobile = () => {
  // 移动端选择会话后,无需额外操作
}
</script>

<template>
  <section class="el-container">
    <!-- PC端: 侧边栏 + 聊天内容 -->
    <template v-if="!isMobile">
      <aside
        v-show="dialogueStore.isShowSessionMenu"
        v-dropsize="{
          min: 200,
          max: 500,
          direction: 'right',
          key: 'aside-session'
        }"
        class="el-aside aside-session border-right"
      >
        <Sider @tab-talk="onTabTalkMobile" />
      </aside>

      <main class="el-main">
        <component
          :is="indexName ? Panel : Amicable"
          :is-mobile="isMobile"
        />
      </main>
    </template>

    <!-- 移动端: 页面切换 -->
    <template v-else>
      <!-- 没有选中会话时显示会话列表 -->
      <template v-if="!indexName">
        <!-- 移动端顶部标题 -->
        <MobilePageHeader title="消息" />

        <aside
          v-dropsize="{
            min: 200,
            max: 500,
            direction: 'right',
            key: 'aside-session'
          }"
          class="el-aside aside-session-mobile"
        >
          <Sider @tab-talk="onTabTalkMobile" />
        </aside>
      </template>

      <!-- 选中会话后显示聊天内容（Panel内部有自己的Header） -->
      <main v-else class="el-main mobile-chat">
        <component
          :is="Panel"
          :is-mobile="isMobile"
        />
      </main>
    </template>
  </section>
</template>

<style lang="less" scoped>
.aside-session {
  width: 320px;
  position: relative;
  user-select: none;
}

.aside-session-mobile {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5; // 降低z-index，避免遮挡底部TabBar（TabBar的z-index是1000）
  padding-top: 50px; // 为顶部header留出空间
  padding-bottom: 0; // 不需要padding-bottom，TabBar是fixed定位
  box-sizing: border-box;
  overflow: hidden;
}

.aside-session-mobile :deep(.el-container) {
  height: 100%;
  overflow: hidden;
}

.aside-session-mobile :deep(.el-main) {
  height: 100%;
  overflow-y: auto;
  padding: 0;
}

.mobile-chat {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 15; // 降低z-index，避免遮挡底部TabBar（TabBar的z-index是1000）
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

// 移动端聊天界面的容器需要占满全屏
.mobile-chat :deep(#drawer-container2) {
  height: 100%;
  padding-top: 0; // 移动端聊天界面不需要额外的padding，因为有自己的Header
  padding-bottom: 0; // TabBar是fixed定位，不需要padding-bottom
  box-sizing: border-box;
}

// 移除Header的fixed定位样式，让Header自然布局

html[theme-mode='dark'] {
  .mobile-chat :deep(#drawer-container2 .el-header) {
    background-color: #2a2a2a;
    border-bottom-color: #3a3a3a;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .el-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .el-main {
    width: 100% !important;
    flex: 1;
  }

  .aside-session-mobile {
    border-right: none !important;
  }
}
</style>
