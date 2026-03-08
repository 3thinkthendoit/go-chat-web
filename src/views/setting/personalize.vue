<script lang="ts" setup>
import { computed } from 'vue'
import { NRadioGroup, NRadio } from 'naive-ui'
import { useSettingsStore } from '@/store'
import ResponsiveContainer from '@/components/base/ResponsiveContainer.vue'

const settingsStore = useSettingsStore()

const themeMode = computed({
  get: () => settingsStore.themeMode,
  set: (value: string) => {
    settingsStore.setThemeMode(value)
  }
})

const themes = [
  {
    label: '浅色',
    value: 'light'
  },
  {
    label: '深色',
    value: 'dark'
  },
  {
    label: '跟随系统',
    value: 'auto'
  }
]
</script>

<template>
  <ResponsiveContainer title="个性设置" mobile-title="个性设置" :show-back="true">
    <template #pc>
      <section>
        <h3 class="title">个性设置</h3>
        <div class="view-box">
      <div class="view-list">
        <div class="content">
          <div class="name">主题颜色</div>
          <div class="desc">当前主题颜色 ：{{ themeMode }}</div>
        </div>
        <div class="tools">
          <n-radio-group v-model:value="themeMode" name="theme-group">
            <n-space>
              <n-radio v-for="item in themes" :key="item.value" :value="item.value">
                {{ item.label }}
              </n-radio>
            </n-space>
          </n-radio-group>
        </div>
      </div>

      <div class="view-list">
        <div class="content">
          <div class="name">我的名片</div>
          <div class="desc">当前未设置名片背景</div>
        </div>
        <div class="tools">
          <n-button type="primary" text> 修改 </n-button>
        </div>
      </div>

      <div class="view-list">
        <div class="content">
          <div class="name">聊天背景</div>
          <div class="desc">当前未设置聊天背景图</div>
        </div>
        <div class="tools">
          <n-button type="primary" text> 修改 </n-button>
        </div>
      </div>
    </div>
  </section>
    </template>

    <template #mobile>
      <div class="personalize-mobile-wrapper">
        <div class="personalize-item">
          <div class="personalize-item-left">
            <div class="name">主题颜色</div>
            <div class="desc">当前主题颜色：{{ themeMode }}</div>
          </div>
          <div class="theme-options">
            <n-radio-group v-model:value="themeMode" name="theme-group">
              <n-space vertical>
                <n-radio v-for="item in themes" :key="item.value" :value="item.value">
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </div>
        </div>

        <div class="personalize-item">
          <div class="personalize-item-left">
            <div class="name">我的名片</div>
            <div class="desc">当前未设置名片背景</div>
          </div>
          <n-button type="primary" text>修改</n-button>
        </div>

        <div class="personalize-item">
          <div class="personalize-item-left">
            <div class="name">聊天背景</div>
            <div class="desc">当前未设置聊天背景图</div>
          </div>
          <n-button type="primary" text>修改</n-button>
        </div>
      </div>
    </template>
  </ResponsiveContainer>
</template>

<style lang="less" scoped>
@import '@/assets/css/settting.less';

.personalize-mobile-wrapper {
  padding: 10px;
}

.personalize-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  .personalize-item-left {
    margin-bottom: 10px;

    .name {
      font-size: 15px;
      color: #333;
      margin-bottom: 5px;
    }

    .desc {
      font-size: 12px;
      color: #999;
    }
  }

  .theme-options {
    :deep(.n-radio) {
      margin: 5px 0;
    }
  }
}

html[theme-mode='dark'] {
  .personalize-item {
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
