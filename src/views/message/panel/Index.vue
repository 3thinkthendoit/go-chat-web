<script lang="ts" setup>
import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'
import { NDrawer } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useUserStore, useDialogueStore, useUploadsStore, useTalkStore } from '@/store'
import PanelHeader from './Header.vue'
import PanelContent from './Content.vue'
import PanelFooter from './Footer.vue'
import GroupPanel from '@/components/group/GroupPanel.vue'
import GroupLaunch from '@/components/group/GroupLaunch.vue'
import GroupNoticeDrawer from '@/components/group/GroupNoticeDrawer.vue'
import UploadsModal from '@/components/base/UploadsModal.vue'
import { useEventBus } from '@/hooks'
import { SessionConst } from '@/constant/event-bus'

const props = defineProps<{
  isMobile: boolean
  isMobileDrawer: boolean
}>()

const emit = defineEmits(['open-drawer'])

const router = useRouter()
const userStore = useUserStore()
const dialogueStore = useDialogueStore()
const uploadsStore = useUploadsStore()
const talkStore = useTalkStore()

const members = computed(() => dialogueStore.members)
const isShowEditor = computed(() => dialogueStore.isShowEditor)

// 当前对话参数
const talkParams = reactive({
  uid: computed(() => userStore.uid),
  indexName: computed(() => dialogueStore.index_name),
  talkMode: computed(() => dialogueStore.talk.talk_type),
  toFromId: computed(() => dialogueStore.talk.receiver_id),
  username: computed(() => dialogueStore.talk.username),
  online: computed(() => dialogueStore.online),
  keyboard: computed(() => dialogueStore.keyboard),
  num: computed(() => dialogueStore.members.length)
})

// 是否显示群面板
const isShowGroupAside = ref(false)
const isShowGroupNoticeAside = ref(false)

const showGroupLaunch = ref({
  groupId: 0,
  isShowGroupLaunch: false
})

const events = {
  group: () => {
    isShowGroupAside.value = !isShowGroupAside.value
  },
  'add-group': () => {
    showGroupLaunch.value.groupId = 0

    if (talkParams.talkMode === 2) {
      showGroupLaunch.value.groupId = talkParams.toFromId
    }

    showGroupLaunch.value.isShowGroupLaunch = true
  },
  announcement: () => {
    isShowGroupNoticeAside.value = !isShowGroupNoticeAside.value
  }
}

// Header 工具栏事件
const onPanelHeaderEvent = (eventType: string) => {
  events[eventType]?.()
}

// 返回事件(移动端)
const onBack = () => {
  // 清空当前会话,返回会话列表
  dialogueStore.index_name = ''
  dialogueStore.records = []
  dialogueStore.talk = {
    username: '',
    talk_type: 0,
    receiver_id: 0
  }
}

const onGroupLaunchSuccess = (groupId: number) => {
  talkStore.toTalk(2, groupId, router)
}

// 移动端虚拟键盘处理
const handleKeyboardResize = () => {
  if (!props.isMobile) return

  const visualViewport = (window as any).visualViewport
  if (visualViewport) {
    // 当虚拟键盘弹出时,调整footer位置
    const footer = document.querySelector('.el-footer') as HTMLElement
    if (footer) {
      const keyboardHeight = window.innerHeight - visualViewport.height
      footer.style.bottom = `${keyboardHeight}px`
      footer.style.transform = `translateY(-${keyboardHeight}px)`
    }
  }
}

onMounted(() => {
  // 移动端监听虚拟键盘变化
  if (props.isMobile) {
    const visualViewport = (window as any).visualViewport
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleKeyboardResize)
      visualViewport.addEventListener('scroll', handleKeyboardResize)
    }
  }
})

onUnmounted(() => {
  const visualViewport = (window as any).visualViewport
  if (visualViewport) {
    visualViewport.removeEventListener('resize', handleKeyboardResize)
    visualViewport.removeEventListener('scroll', handleKeyboardResize)
  }
})

useEventBus([
  {
    name: SessionConst.Switch,
    event: () => {
      isShowGroupAside.value = false
    }
  }
])
</script>

<template>
  <section class="el-container is-vertical" id="drawer-container2" style="position: relative">
    <!-- 头部区域 -->
    <header class="el-header border-bottom">
      <PanelHeader
        :talk-mode="talkParams.talkMode"
        :username="talkParams.username"
        :online="talkParams.online"
        :keyboard="talkParams.keyboard"
        :num="talkParams.num"
        :show-session-menu="dialogueStore.isShowSessionMenu"
        :is-mobile="isMobile"
        @evnet="onPanelHeaderEvent"
        @back="onBack"
        @change-session-menu="
          (value: boolean) => {
            dialogueStore.isShowSessionMenu = value
          }
        "
      />
    </header>

    <!-- 聊天区域 -->
    <main class="el-main">
      <PanelContent
        :uid="talkParams.uid"
        :talk-mode="talkParams.talkMode"
        :to-from-id="talkParams.toFromId"
        :index-name="talkParams.indexName"
        :is-mobile="isMobile"
      />
    </main>

    <!-- 编辑器区域 -->
    <footer
      v-show="isShowEditor"
      class="el-footer"
      :style="isMobile ? { height: 'auto', minHeight: '64px' } : { height: 160 + 'px' }"
      v-dropsize="{ min: 100, max: 600, direction: 'top', key: 'editor' }"
    >
      <PanelFooter
        :uid="talkParams.uid"
        :index-name="talkParams.indexName"
        :talk-mode="talkParams.talkMode"
        :to-from-id="talkParams.toFromId"
        :online="talkParams.online"
        :members="members"
        :is-mobile="isMobile"
      />
    </footer>
  </section>

  <n-drawer
    v-model:show="uploadsStore.isShow"
    :width="isMobile ? '100%' : 400"
    placement="right"
    :trap-focus="false"
    :block-scroll="false"
    show-mask="transparent"
    to="#drawer-container2"
  >
    <UploadsModal />
  </n-drawer>

  <GroupNoticeDrawer v-model="isShowGroupNoticeAside" :group-id="talkParams.toFromId" />

  <n-drawer
    v-model:show="isShowGroupAside"
    :width="isMobile ? '100%' : 400"
    placement="right"
    show-mask="transparent"
    to="#drawer-container2"
  >
    <GroupPanel :group-id="talkParams.toFromId" @close="isShowGroupAside = false" />
  </n-drawer>

  <GroupLaunch
    v-if="showGroupLaunch.isShowGroupLaunch"
    :group-id="showGroupLaunch.groupId"
    @close="showGroupLaunch.isShowGroupLaunch = false"
    @on-submit="onGroupLaunchSuccess"
  />
</template>

<style lang="less" scoped>
// 移动端样式
@media screen and (max-width: 768px) {
  @supports (padding: max(0px)) {
    .panel-header {
      padding-left: max(15px, env(safe-area-inset-left));
      padding-right: max(15px, env(safe-area-inset-right));
    }

    .panel-header {
      padding-top: max(15px, env(safe-area-inset-top));
    }
  }

  #drawer-container2 {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100%;
    background-color: #f5f5f5;
    padding-bottom: 0; // TabBar是fixed定位，不需要padding-bottom
    box-sizing: border-box;
    overflow: hidden; // 防止内容溢出

    .el-header {
      // Header固定在顶部
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100vw;
      height: 50px;
      z-index: 100;
    }

    .el-main {
      // 聊天内容区域
      padding-top: 50px; // Header高度
      padding-bottom: 72px; // 为底部输入框预留空间(min-height 64px + padding 8px)
      box-sizing: border-box;
      overflow-y: auto;
      height: 100%;

      // 确保消息内容不会被遮挡
      .panel-content {
        min-height: calc(100% - 72px);
      }
    }

    .el-footer {
      // Footer固定在底部（微信风格横向布局）
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      height: auto !important;
      min-height: 64px !important;
      max-height: 300px !important;
      background-color: #e8e8e8 !important;
      border-top: 1px solid #e5e5e5 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      z-index: 90 !important;

      // 内容自适应高度
      display: flex !important;
      align-items: flex-end !important;

      // 覆盖 mobile.less 中的 padding
      padding-left: 0 !important;
      padding-right: 0 !important;

      // 覆盖 mobile.less 中的 @supports padding
      @supports (padding: max(0px)) {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      // 安全区域适配(iPhone刘海屏)
      padding-bottom: env(safe-area-inset-bottom) !important;

      // 防止被虚拟键盘遮挡
      transition: transform 0.2s ease-out !important;
      will-change: transform, bottom !important;
    }
  }
}

// PC端微信风格
@media screen and (min-width: 769px) {
  #drawer-container2 {
    background-color: #f5f5f5;
  }

  .el-footer {
    background-color: #f7f7f7;
    border-top: 1px solid #e5e5e5;
    padding: 8px 15px;
    box-sizing: border-box;
  }
}
</style>
