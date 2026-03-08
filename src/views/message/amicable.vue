<script lang="ts" setup>
import Welcome from '@/assets/image/welcome.svg'

defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="amicable flex-center">
    <div class="content" :class="{ 'mobile-content': isMobile }">
      <img :src="Welcome" />
      <p>LumenIM 欢迎您(*^__^*)</p>
    </div>
  </div>
</template>

<style lang="less" scoped>
.amicable {
  height: 100%;
  width: 100%;
  -webkit-app-region: drag;

  .content {
    width: 400px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 18px;
    font-weight: 300;

    img {
      width: 200px;
      height: 200px;
    }
  }

  .mobile-content {
    width: 280px;
    height: 250px;

    img {
      width: 150px;
      height: 150px;
    }

    p {
      font-size: 16px;
    }
  }
}

@media screen and (max-width: 768px) {
  .amicable .content {
    width: 280px;
    height: 250px;

    img {
      width: 150px;
      height: 150px;
    }

    p {
      font-size: 14px;
    }
  }
}
</style>
