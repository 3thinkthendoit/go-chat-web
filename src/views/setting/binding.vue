<script lang="ts" setup>
import ResponsiveContainer from '@/components/base/ResponsiveContainer.vue'
</script>

<template>
  <ResponsiveContainer title="绑定设置" mobile-title="绑定设置" :show-back="true">
    <template #pc>
      <section>
        <h3 class="title">绑定设置</h3>
        <div class="view-box">
      <div class="view-list">
        <div class="image">
          <img src="~@/assets/image/github-avatar.jpg" width="50" height="50" />
        </div>
        <div class="content">
          <div class="name">绑定 github</div>
          <div class="desc">当前未绑定github账号</div>
        </div>
        <div class="tools">
          <n-button type="primary" text> 设置 </n-button>
        </div>
      </div>

      <div class="view-list">
        <div class="image">
          <img src="~@/assets/image/gitee-avatar.jpg" width="50" height="50" />
        </div>
        <div class="content">
          <div class="name">绑定 gitee</div>
          <div class="desc">当前未绑定gitee账号</div>
        </div>
        <div class="tools">
          <n-button type="primary" text> 设置 </n-button>
        </div>
      </div>
    </div>
  </section>
    </template>

    <template #mobile>
      <div class="binding-mobile-wrapper">
        <div class="binding-item">
          <div class="binding-item-left">
            <img src="~@/assets/image/github-avatar.jpg" width="40" height="40" />
            <div>
              <div class="name">绑定 github</div>
              <div class="desc">当前未绑定github账号</div>
            </div>
          </div>
          <n-button type="primary" text>设置</n-button>
        </div>

        <div class="binding-item">
          <div class="binding-item-left">
            <img src="~@/assets/image/gitee-avatar.jpg" width="40" height="40" />
            <div>
              <div class="name">绑定 gitee</div>
              <div class="desc">当前未绑定gitee账号</div>
            </div>
          </div>
          <n-button type="primary" text>设置</n-button>
        </div>
      </div>
    </template>
  </ResponsiveContainer>
</template>

<style lang="less" scoped>
@import '@/assets/css/settting.less';

.view-box {
  .view-list {
    .image {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 60px;

      img {
        border-radius: 50%;
        overflow: hidden;
      }
    }
  }
}

.binding-mobile-wrapper {
  padding: 10px;
}

.binding-item {
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

  .binding-item-left {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      border-radius: 50%;
    }

    .name {
      font-size: 15px;
      color: #333;
      margin-bottom: 4px;
    }

    .desc {
      font-size: 12px;
      color: #999;
    }
  }
}

html[theme-mode='dark'] {
  .binding-item {
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
