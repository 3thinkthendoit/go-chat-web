<script lang="ts" setup>
import { ref } from 'vue'
import EditPassword from '@/components/user/EditorPassword.vue'
import EditMobile from '@/components/user/EditorMobile.vue'
import EditEmail from '@/components/user/EditorEmail.vue'
import { useUserStore } from '@/store'
import { hidePhone } from '@/utils/string'
import ResponsiveContainer from '@/components/base/ResponsiveContainer.vue'

const userStore = useUserStore()
const isShowChangePassword = ref(false)
const isShowChangeMobile = ref(false)
const isShowChangeEmail = ref(false)

const onChangeMobileSuccess = (value: string) => {
  isShowChangeMobile.value = false
  userStore.mobile = value
}

const onChangeEmailSuccess = (value: string) => {
  isShowChangeEmail.value = false
  userStore.email = value
}
</script>

<template>
  <ResponsiveContainer title="安全设置" mobile-title="安全设置" :show-back="true">
    <template #pc>
      <section>
        <h3 class="title">安全设置</h3>
        <div class="view-box">
      <div class="view-list">
        <div class="content">
          <div class="name">账户密码</div>
          <div class="desc">当前密码强度 ：中</div>
        </div>
        <div class="tools">
          <n-button type="primary" text @click="isShowChangePassword = true"> 修改 </n-button>
        </div>
      </div>

      <div class="view-list">
        <div class="content">
          <div class="name">绑定手机</div>
          <div class="desc">已绑定手机 ：{{ hidePhone(userStore.mobile) }}</div>
        </div>
        <div class="tools">
          <n-button type="primary" text @click="isShowChangeMobile = true"> 修改 </n-button>
        </div>
      </div>

      <div class="view-list">
        <div class="content">
          <div class="name">绑定邮箱</div>
          <div class="desc">已绑定邮箱 ：{{ userStore.email || '未设置' }}</div>
        </div>
        <div class="tools">
          <n-button type="primary" text @click="isShowChangeEmail = true"> 修改 </n-button>
        </div>
      </div>
    </div>
  </section>
    </template>

    <template #mobile>
      <div class="security-mobile-wrapper">
        <div class="security-item">
          <div class="security-item-left">
            <div class="name">账户密码</div>
            <div class="desc">当前密码强度：中</div>
          </div>
          <n-button type="primary" text @click="isShowChangePassword = true">修改</n-button>
        </div>

        <div class="security-item">
          <div class="security-item-left">
            <div class="name">绑定手机</div>
            <div class="desc">已绑定手机：{{ hidePhone(userStore.mobile) }}</div>
          </div>
          <n-button type="primary" text @click="isShowChangeMobile = true">修改</n-button>
        </div>

        <div class="security-item">
          <div class="security-item-left">
            <div class="name">绑定邮箱</div>
            <div class="desc">已绑定邮箱：{{ userStore.email || '未设置' }}</div>
          </div>
          <n-button type="primary" text @click="isShowChangeEmail = true">修改</n-button>
        </div>
      </div>
    </template>

    <EditPassword v-model="isShowChangePassword" />
    <EditMobile v-model="isShowChangeMobile" @success="onChangeMobileSuccess" />
    <EditEmail v-model="isShowChangeEmail" @success="onChangeEmailSuccess" />
  </ResponsiveContainer>
</template>
<style lang="less" scoped>
@import '@/assets/css/settting.less';

.security-mobile-wrapper {
  padding: 10px;
}

.security-item {
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

  .security-item-left {
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
  }
}

html[theme-mode='dark'] {
  .security-item {
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
