<script lang="ts" setup>
import { NPopover } from 'naive-ui'
import {
  PeoplePlusOne,
  MenuUnfoldOne,
  MenuFoldOne,
  Announcement,
  PhoneVideoCall,
  VideoOne,
  More,
  Left
} from '@icon-park/vue-next'

const emit = defineEmits(['evnet', 'changeSessionMenu', 'back'])

const props = defineProps({
  talkMode: {
    type: Number,
    default: 1
  },
  username: {
    type: String,
    default: ''
  },
  online: {
    type: Boolean,
    default: false
  },
  keyboard: {
    type: Boolean,
    default: false
  },
  num: {
    type: Number,
    default: 0
  },
  showSessionMenu: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const onSetMenu = () => {
  emit('changeSessionMenu', !props.showSessionMenu)
}
</script>

<template>
  <header class="el-header panel-header">
    <!-- 移动端返回按钮 -->
    <div v-if="isMobile" class="mobile-back border-right pointer" @click="emit('back')">
      <n-icon :component="Left" :size="22" />
    </div>

    <!-- PC端菜单按钮 -->
    <div v-else class="menu border-right pointer" @click="onSetMenu">
      <n-icon :component="showSessionMenu ? MenuUnfoldOne : MenuFoldOne" :size="22" />
    </div>

    <div class="module left-module">
      <span class="tag" :class="{ red: talkMode == 1 }">
        {{ talkMode == 1 ? '好友' : '群聊' }}
      </span>
      <span class="online online-status" v-show="online"></span>
      <span class="nickname text-ellipsis">{{ username }}</span>
      <span class="keyboard" v-show="keyboard">对方正在输入...</span>
      <span class="num" v-show="talkMode == 2 && num">({{ num }})</span>
    </div>

    <div class="module right-module">
      <n-popover trigger="hover">
        <template #trigger>
          <n-icon
            class="icon"
            v-show="talkMode == 2"
            :component="Announcement"
            :size="18"
            @click="emit('evnet', 'announcement')"
          />
        </template>
        群公告
      </n-popover>

      <!-- <n-popover trigger="hover">
        <template #trigger>
          <n-icon
            class="icon"
            v-show="talkMode == 1"
            :component="PhoneVideoCall"
            :size="18"
            @click="emit('evnet', 'phone_video_call')"
          />
        </template>
        语音通话
      </n-popover>

      <n-popover trigger="hover">
        <template #trigger>
          <n-icon
            class="icon"
            v-show="talkMode == 1"
            :component="VideoOne"
            :size="18"
            @click="emit('evnet', 'facetime')"
          />
        </template>
        视频通话
      </n-popover> -->

      <n-popover trigger="hover">
        <template #trigger>
          <n-icon
            class="icon"
            :component="PeoplePlusOne"
            :size="18"
            @click="emit('evnet', 'add-group')"
          />
        </template>
        {{ talkMode === 1 ? '发起群聊' : '邀请好友' }}
      </n-popover>

      <n-popover trigger="hover">
        <template #trigger>
          <n-icon
            class="icon"
            v-show="talkMode == 2"
            :component="More"
            :size="18"
            @click="emit('evnet', 'group')"
          />
        </template>
        群详情
      </n-popover>
    </div>
  </header>
</template>

<style lang="less" scoped>
.panel-header {
  height: 50px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  -webkit-app-region: drag;
  position: relative;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;

  .menu, .mobile-back {
    width: 40px;
    height: 50px;
    position: absolute;
    display: flex;
    align-items: center;
    left: 0;
    justify-content: center;
    color: #000;
  }

  .module {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .left-module {
    padding-right: 5px;
    margin-left: 50px;

    .keyboard {
      animation: inputfade 1s infinite;
      -webkit-animation: inputfade 1s infinite;
      margin-left: 5px;
      font-size: 12px;
    }

    .online {
      margin-left: 10px;
    }
  }

  .right-module {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .icon {
      cursor: pointer;
      margin: 0 8px;
    }
  }

  // 移动端样式适配
  @media screen and (max-width: 768px) {
    padding: 0 10px;
    background-color: #f5f5f5;
    height: 50px;
    overflow-x: hidden; // 禁止横向滚动
    touch-action: none; // 禁止所有触摸手势
    overscroll-behavior: none; // 禁止过度滚动

    .menu, .mobile-back {
      width: 40px;
      height: 50px;
      position: absolute;
      display: flex;
      align-items: center;
      left: 0;
      justify-content: center;
      color: #000;
      z-index: 10;
    }

    .left-module {
      margin-left: 40px;
      flex: 1;
      min-width: 0;
      justify-content: center;
      padding-right: 40px;

      .nickname {
        font-size: 17px;
        font-weight: 500;
        color: #000;
        text-align: center;
      }

      .tag, .online, .keyboard, .num {
        display: none;
      }
    }

    .right-module {
      position: absolute;
      right: 0;
      top: 0;
      height: 50px;
      display: flex;
      align-items: center;
      padding-right: 10px;
      z-index: 10;

      .icon {
        margin: 0 6px;
        color: #000;
      }
    }
  }
}

// PC端也使用微信风格的头部
@media screen and (min-width: 769px) {
  .panel-header {
    background-color: #f5f5f5;
    border-bottom: 1px solid #e5e5e5;

    .left-module {
      .nickname {
        font-size: 16px;
        font-weight: 500;
        color: #000;
      }
    }

    .right-module {
      .icon {
        color: #000;
      }
    }
  }
}

/* css 动画 */
@keyframes inputfade {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

@-webkit-keyframes inputfade {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

@-webkit-keyframes antStatusProcessing {
  0% {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.5;
  }

  to {
    -webkit-transform: scale(2.4);
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes antStatusProcessing {
  0% {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.5;
  }

  to {
    -webkit-transform: scale(2.4);
    transform: scale(2.4);
    opacity: 0;
  }
}

.tag {
  display: none; // 微信风格不显示标签
}

.online-status {
  position: relative;
  top: -1px;
  display: inline-block;
  width: 6px;
  height: 6px;
  vertical-align: middle;
  border-radius: 50%;
  position: relative;
  background-color: #1890ff;
  margin-right: 5px;

  &:after {
    position: absolute;
    top: -1px;
    left: -1px;
    width: 100%;
    height: 100%;
    border: 1px solid #1890ff;
    border-radius: 50%;
    -webkit-animation: antStatusProcessing 1.2s ease-in-out infinite;
    animation: antStatusProcessing 1.2s ease-in-out infinite;
    content: '';
  }
}
</style>
