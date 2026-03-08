<script lang="ts" setup>
import { NImage } from 'naive-ui'
import { getImageInfo } from '@/utils/file'
import { ITalkRecordExtraImage, ITalkRecord } from '@/types/chat'
import { computed } from 'vue'

defineProps<{
  extra: ITalkRecordExtraImage
  data: ITalkRecord
  maxWidth?: Boolean
  talkMode?: Number
}>()

const img = (src: string, width = 200) => {
  const info = getImageInfo(src)

  if (info.width == 0 || info.height == 0) {
    return {}
  }

  if (info.width < width) {
    return {
      width: `${info.width}px`,
      height: `${info.height}px`
    }
  }

  return {
    width: width + 'px',
    height: `${info.height / (info.width / width)}px`
  }
}

// 判断是否为移动端
const isMobile = computed(() => {
  return window.innerWidth <= 768
})
</script>
<template>
  <section
    class="immsg-image"
    :class="{ right: data.float === 'right' }"
    :style="img(extra.url, isMobile ? 120 : 350)"
  >
    <n-image :src="extra.url" />
  </section>
</template>
<style lang="less" scoped>
.immsg-image {
  overflow: hidden;
  padding: 0;
  border-radius: 5px;
  background: transparent;
  min-width: 30px;
  min-height: 30px;

  :deep(.n-image img) {
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }
}
</style>
