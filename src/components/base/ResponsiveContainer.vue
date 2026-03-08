<script lang="ts" setup>
import { useSlots, computed } from 'vue'
import { useMobile } from '@/hooks/useMobile'

interface Props {
  /** PC端页面标题（可选） */
  title?: string
  /** 是否显示移动端标题栏 */
  showMobileHeader?: boolean
  /** 移动端页面标题 */
  mobileTitle?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 自定义移动端标题栏样式 */
  customHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showMobileHeader: true,
  mobileTitle: '',
  showBack: false,
  customHeader: false
})

const emit = defineEmits(['back'])

const slots = useSlots()
const { isMobile } = useMobile()

const displayTitle = computed(() => props.mobileTitle || props.title)
</script>

<template>
  <!-- PC端显示 -->
  <template v-if="!isMobile">
    <slot name="pc">
      <section class="el-container is-vertical height100">
        <header v-if="title" class="el-header border-bottom">{{ title }}</header>
        <main class="el-main">
          <slot />
        </main>
      </section>
    </slot>
  </template>

  <!-- 移动端显示 -->
  <template v-else>
    <slot name="mobile">
      <section class="mobile-page-container">
        <template v-if="!customHeader && showMobileHeader">
          <slot name="mobile-header">
            <MobilePageHeader :title="displayTitle" :show-back="showBack" @back="emit('back')" />
          </slot>
        </template>
        <main class="mobile-page-main">
          <slot />
        </main>
      </section>
    </slot>
  </template>
</template>

<script lang="ts">
import MobilePageHeader from '@/components/mobile/MobilePageHeader.vue'

export default {
  components: {
    MobilePageHeader
  }
}
</script>

<style lang="less" scoped>
.mobile-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-page-main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
</style>
