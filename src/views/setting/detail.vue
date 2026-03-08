<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NDatePicker, NRadio, NRadioGroup, NSpace } from 'naive-ui'
import { ServeUpdateUserDetail, ServeGetUserDetail } from '@/api/user'
import { toApi } from '@/api'
import AvatarCropper from '@/components/base/AvatarCropper.vue'
import { hidePhone } from '@/utils/string'
import { useInject } from '@/hooks'
import { useUserStore } from '@/store'
import ResponsiveContainer from '@/components/base/ResponsiveContainer.vue'

const router = useRouter()
const userStore = useUserStore()
const { message } = useInject()
const cropper = ref(false)
const loading = ref(false)

const detail = reactive({
  avatar: '',
  nickname: '',
  mobile: '',
  email: '',
  gender: '0',
  motto: '0',
  birthday: ref()
})

const loadDetail = async () => {
  const { code, data } = await toApi(ServeGetUserDetail)
  if (code != 200) return

  detail.nickname = data.nickname.toString()
  detail.mobile = data.mobile.toString()
  detail.email = data.email.toString()
  detail.gender = data.gender.toString()
  detail.motto = data.motto.toString()
  detail.avatar = data.avatar

  if (data.birthday) {
    detail.birthday = ref(data.birthday)
  }
}

// 修改用户信息
const onChangeDetail = async () => {
  if (!detail.nickname.trim()) {
    return message.warning('昵称不能为空')
  }

  if (detail.motto.length > 500) {
    return message.warning('个性签名文字长度不能超过500')
  }

  const { code } = await toApi(
    ServeUpdateUserDetail,
    {
      nickname: detail.nickname.trim(),
      avatar: detail.avatar,
      motto: detail.motto,
      gender: parseInt(detail.gender),
      birthday: detail.birthday
    },
    { loading, showMessageText: '信息保存成功' }
  )

  if (code != 200) return

  userStore.avatar = detail.avatar
  userStore.motto = detail.motto
}

const onUploadAvatar = (avatar: string) => {
  cropper.value = false
  detail.avatar = avatar
  onChangeDetail()
}

loadDetail()
</script>

<template>
  <ResponsiveContainer title="个人信息" mobile-title="个人中心" :show-back="true">
    <template #pc>
      <h3 class="title">个人信息</h3>
      <section class="el-container container">
        <aside class="el-aside el-aside-left">
          <n-avatar
            :size="150"
            :src="detail.avatar"
            @click="cropper = true"
            class="avatar-box pointer"
          />

          <n-button text @click="cropper = true"> 点击修改头像 </n-button>
        </aside>

        <main class="el-main" style="padding-right: 20px">
          <n-form
            ref="formRef"
            label-placement="left"
            label-width="auto"
            require-mark-placement="right-hanging"
            size="medium"
            style="max-width: 500px; margin-top: 25px"
          >
            <n-form-item label="登录账号：">
              {{ hidePhone(detail.mobile) }}
              <n-button class="mt-l15" type="primary" text @click="router.push('/settings/security')">
                修改
              </n-button>
            </n-form-item>
            <n-form-item label="电子邮箱：">
              {{ detail.email }}
              <n-button class="mt-l15" type="primary" text @click="router.push('/settings/security')">
                修改
              </n-button>
            </n-form-item>
            <n-form-item label="我的昵称：">
              <n-input
                placeholder="我的昵称"
                v-model:value="detail.nickname"
                maxlength="20"
                show-count
              />
            </n-form-item>
            <n-form-item label="我的性别：">
              <n-radio-group v-model:value="detail.gender" name="gender">
                <n-space>
                  <n-radio key="1" value="1"> 男 </n-radio>
                  <n-radio key="2" value="2"> 女 </n-radio>
                  <n-radio key="0" value="0"> 保密 </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="我的生日：">
              <n-date-picker
                v-model:formatted-value="detail.birthday"
                type="date"
                value-format="yyyy-MM-dd"
              />
            </n-form-item>
            <n-form-item label="个性签名：">
              <n-input
                placeholder="编辑个签，展示我的独特态度"
                type="textarea"
                maxlength="500"
                show-count
                v-model:value="detail.motto"
                :autosize="{
                  minRows: 3,
                  maxRows: 5
                }"
              />
            </n-form-item>

            <n-form-item>
              <n-button
                type="primary"
                @click="onChangeDetail"
                :loading="loading"
                text-color="#ffffff"
                style="margin-left: 94px"
              >
                保存修改
              </n-button>
            </n-form-item>
          </n-form>
        </main>
      </section>

      <!-- 头像裁剪组件 -->
      <AvatarCropper v-if="cropper" @close="cropper = false" @success="onUploadAvatar" />
    </template>

    <template #mobile>
      <div class="personal-mobile-wrapper">
        <div class="avatar-section">
          <n-avatar
            :size="80"
            :src="detail.avatar"
            @click="cropper = true"
            class="avatar-box pointer"
          />
          <div class="avatar-desc">点击修改头像</div>
        </div>

        <div class="form-section">
          <div class="form-item">
            <label>登录账号</label>
            <div class="value-action">
              <span>{{ hidePhone(detail.mobile) }}</span>
              <n-button type="primary" text @click="router.push('/settings/security')">修改</n-button>
            </div>
          </div>

          <div class="form-item">
            <label>电子邮箱</label>
            <div class="value-action">
              <span>{{ detail.email }}</span>
              <n-button type="primary" text @click="router.push('/settings/security')">修改</n-button>
            </div>
          </div>

          <div class="form-item">
            <label>我的昵称</label>
            <n-input
              placeholder="我的昵称"
              v-model:value="detail.nickname"
              maxlength="20"
              show-count
            />
          </div>

          <div class="form-item">
            <label>我的性别</label>
            <n-radio-group v-model:value="detail.gender" name="gender">
              <n-space>
                <n-radio key="1" value="1"> 男 </n-radio>
                <n-radio key="2" value="2"> 女 </n-radio>
                <n-radio key="0" value="0"> 保密 </n-radio>
              </n-space>
            </n-radio-group>
          </div>

          <div class="form-item">
            <label>我的生日</label>
            <n-date-picker
              v-model:formatted-value="detail.birthday"
              type="date"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </div>

          <div class="form-item">
            <label>个性签名</label>
            <n-input
              placeholder="编辑个签，展示我的独特态度"
              type="textarea"
              maxlength="500"
              show-count
              v-model:value="detail.motto"
              :autosize="{
                minRows: 3,
                maxRows: 5
              }"
            />
          </div>

          <div class="form-item">
            <n-button
              type="primary"
              block
              @click="onChangeDetail"
              :loading="loading"
            >
              保存修改
            </n-button>
          </div>
        </div>
      </div>

      <!-- 头像裁剪组件 -->
      <AvatarCropper v-if="cropper" @close="cropper = false" @success="onUploadAvatar" />
    </template>
  </ResponsiveContainer>
</template>

<style lang="less" scoped>
@import '@/assets/css/settting.less';

.container {
  height: auto;
}

.el-aside-left {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  margin-right: 10px;
}

.avatar-box {
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 20px;
}

// 移动端样式
.personal-mobile-wrapper {
  padding: 10px;
}

.avatar-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;

  .avatar-desc {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
  }
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
}

.form-item {
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .value-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;

    span {
      font-size: 14px;
      color: #333;
    }
  }
}

html[theme-mode='dark'] {
  .avatar-section,
  .form-section {
    background-color: #2a2a2a;
  }

  .form-item {
    label {
      color: #e0e0e0;
    }

    .value-action {
      border-bottom-color: #3a3a3a;

      span {
        color: #e0e0e0;
      }
    }
  }
}
</style>
