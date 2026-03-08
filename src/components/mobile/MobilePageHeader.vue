<script lang="ts" setup>
import { computed } from 'vue'
import { Left } from '@icon-park/vue-next'
import { useRouter } from 'vue-router'

interface Props {
  title: string
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false
})

const emit = defineEmits(['back'])

const router = useRouter()

const onBack = () => {
  emit('back')
  if (!emit('back')) {
    router.back()
  }
}
</script>

<template>
  <header class="mobile-page-header">
    <div class="header-left" v-if="showBack" @click="onBack">
      <n-icon :size="20" :component="Left" />
    </div>
    <div class="header-title">{{ title }}</div>
    <div class="header-right"></div>
  </header>
</template>

<style lang="less" scoped>
.mobile-page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #ededed;
  border-bottom: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  box-sizing: border-box;
  z-index: 999;
  user-select: none;
  -webkit-user-select: none;
  overflow-x: hidden; // 禁止横向滚动
  touch-action: none; // 禁止所有触摸手势
  overscroll-behavior: none; // 禁止过度滚动

  .header-left,
  .header-right {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  .header-title {
    flex: 1;
    font-size: 17px;
    font-weight: 500;
    color: #000;
    text-align: center;
  }
}

// 暗色模式
html[theme-mode='dark'] {
  .mobile-page-header {
    background-color: #2a2a2a;
    border-bottom-color: #3a3a3a;

    .header-title {
      color: #e0e0e0;
    }
  }
}
</style>

<!-- 全局样式：确保PageHeader始终固定在顶部，不受父容器影响 -->
<style lang="less">
.mobile-page-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 999 !important;
  overflow-x: hidden !important;
  touch-action: none !important;
  overscroll-behavior: none !important;
}
</style>
