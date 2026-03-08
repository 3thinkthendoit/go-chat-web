<script lang="ts" setup>
import { reactive, computed, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useSettingsStore, useTalkStore } from '@/store'
import { NPopover } from 'naive-ui'
import AccountCard from './AccountCard.vue'
import { SettingTwo, Message, People, BookmarkOne } from '@icon-park/vue-next'

const userStore = useUserStore()
const talkStore = useTalkStore()
const router = useRouter()
const settingsStore = useSettingsStore()

const color = computed(() => {
  return settingsStore.currentThemeMode == 'dark' ? '#ffffff' : '#999'
})

const activeColor = computed(() => {
  return settingsStore.currentThemeMode == 'dark' ? '#ffffff' : 'rgb(24, 144, 255)'
})

const menus = reactive([
  {
    link: '/message',
    icon: markRaw(Message),
    title: '消息',
    hotspot: computed(() => talkStore.talkUnreadNum > 0)
  },
  {
    link: '/contact',
    icon: markRaw(People),
    title: '通讯录',
    hotspot: computed(() => userStore.isContactApply || userStore.isGroupApply)
  },
  {
    link: '/note',
    icon: markRaw(BookmarkOne),
    title: '笔记'
  },
  {
    link: '/settings',
    icon: markRaw(SettingTwo),
    title: '设置'
  }
])

const onClickMenu = (menu) => {
  if (menu.external) {
    window.open(menu.link)
  } else {
    router.push(menu.link)
  }
}

const isActive = (menu) => {
  return router.currentRoute.value.path.indexOf(menu.link) >= 0
}
</script>

<template>
  <section class="mobile-tabbar">
    <div
      v-for="nav in menus"
      :key="nav.link"
      :class="{
        'tab-item': true,
        active: isActive(nav)
      }"
      @click="onClickMenu(nav)"
    >
      <!-- 消息提示红点 -->
      <div class="hotspot" v-if="nav.hotspot" />

      <component
        :is="nav.icon"
        :theme="isActive(nav) ? 'filled' : 'outline'"
        :fill="isActive(nav) ? activeColor : color"
        :strokeWidth="2"
        :size="24"
      />

      <span>{{ nav.title }}</span>
    </div>
  </section>
</template>

<style lang="less" scoped>
.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #f7f7f7;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999; // 提高z-index到9999
  user-select: none;
  -webkit-user-select: none;
  overflow-x: hidden; // 禁止横向滚动
  touch-action: none; // 禁止所有触摸手势
  overscroll-behavior: none; // 禁止过度滚动
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  color: #999;
  font-size: 10px;
  transition: all 0.3s;

  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }

  &.active {
    color: rgb(24, 144, 255);
  }

  .hotspot {
    position: absolute;
    top: 8px;
    right: 25%;
    width: 8px;
    height: 8px;
    background-color: #ff4d4f;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  svg {
    margin-bottom: 2px;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

// 暗色模式
html[theme-mode='dark'] {
  .mobile-tabbar {
    background-color: #1a1a1a;
    border-top-color: rgba(255, 255, 255, 0.1);

    .tab-item {
      color: #666;

      &.active {
        color: rgb(24, 144, 255);
      }

      .hotspot {
        background-color: #ff4d4f;
      }
    }
  }
}
</style>

<!-- 全局样式：确保TabBar始终固定在底部，不受父容器影响 -->
<style lang="less">
.mobile-tabbar {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 9999 !important;
  overflow-x: hidden !important;
  touch-action: none !important;
  overscroll-behavior: none !important;
}
</style>
