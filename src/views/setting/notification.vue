<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NSwitch } from 'naive-ui'
import { useSettingsStore } from '@/store'
import ResponsiveContainer from '@/components/base/ResponsiveContainer.vue'

const settingsStore = useSettingsStore()

const isPromptTone = computed({
  get: () => settingsStore.isPromptTone,
  set: (value) => {
    settingsStore.setPromptTone(value)
  }
})

const isKeyboard = computed({
  get: () => settingsStore.isKeyboard,
  set: (value) => {
    settingsStore.setKeyboard(value)
  }
})

const isNotify = computed({
  get: () => settingsStore.isNotify,
  set: (value) => {
    settingsStore.setNotify(value)
    value && toPermission()
  }
})

const hasPermission = ref(false)

hasPermission.value = Notification.permission === 'granted'

const toPermission = () => {
  Notification.requestPermission().then((permission) => {
    hasPermission.value = permission === 'granted'
  })
}
</script>

<template>
  <ResponsiveContainer title="通知设置" mobile-title="通知设置" :show-back="true">
    <template #pc>
      <section>
        <h3 class="title">通知设置</h3>
        <div class="view-box">
      <div class="view-list">
        <div class="content">
          <div class="name">新消息提示音</div>
          <div class="desc">新消息提示音 ：{{ isPromptTone ? '已开启' : '已关闭' }}</div>
        </div>
        <div class="tools">
          <n-switch size="medium" v-model:value="isPromptTone" />
        </div>
      </div>

      <div class="view-list">
        <div class="content">
          <div class="name">推送键盘输入消息</div>
          <div class="desc">推送键盘输入消息：{{ isKeyboard ? '已开启' : '已关闭' }}</div>
        </div>
        <div class="tools">
          <n-switch size="medium" v-model:value="isKeyboard" />
        </div>
      </div>

      <div class="view-list">
        <div class="content">
          <div class="name">消息通知</div>
          <div class="desc">
            消息通知：{{ isNotify ? '已开启' : '已关闭' }}

            <span v-show="isNotify && !hasPermission">
              (当前未获得浏览器通知权限，
              <n-button type="primary" text @click="toPermission">点击获取权限</n-button>)
            </span>
          </div>
        </div>
        <div class="tools">
          <n-switch size="medium" v-model:value="isNotify" />
        </div>
      </div>
    </div>
  </section>
    </template>

    <template #mobile>
      <div class="notification-mobile-wrapper">
        <div class="notification-item">
          <div class="notification-item-left">
            <div class="name">新消息提示音</div>
            <div class="desc">新消息提示音：{{ isPromptTone ? '已开启' : '已关闭' }}</div>
          </div>
          <n-switch size="medium" v-model:value="isPromptTone" />
        </div>

        <div class="notification-item">
          <div class="notification-item-left">
            <div class="name">推送键盘输入消息</div>
            <div class="desc">推送键盘输入消息：{{ isKeyboard ? '已开启' : '已关闭' }}</div>
          </div>
          <n-switch size="medium" v-model:value="isKeyboard" />
        </div>

        <div class="notification-item">
          <div class="notification-item-left">
            <div class="name">消息通知</div>
            <div class="desc">
              消息通知：{{ isNotify ? '已开启' : '已关闭' }}
              <div v-if="isNotify && !hasPermission" class="permission-tip">
                当前未获得浏览器通知权限，
                <n-button type="primary" text @click="toPermission">点击获取权限</n-button>
              </div>
            </div>
          </div>
          <n-switch size="medium" v-model:value="isNotify" />
        </div>
      </div>
    </template>
  </ResponsiveContainer>
</template>

<style lang="less" scoped>
@import '@/assets/css/settting.less';

.notification-mobile-wrapper {
  padding: 10px;
}

.notification-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }

  .notification-item-left {
    flex: 1;

    .name {
      font-size: 15px;
      color: #333;
      margin-bottom: 5px;
    }

    .desc {
      font-size: 12px;
      color: #999;
    }

    .permission-tip {
      margin-top: 5px;
      color: #ff6b6b;
      font-size: 11px;
    }
  }
}

html[theme-mode='dark'] {
  .notification-item {
    background-color: #2a2a2a;

    .name {
      color: #e0e0e0;
    }

    .desc {
      color: #999;
    }
  }
}
</style>
