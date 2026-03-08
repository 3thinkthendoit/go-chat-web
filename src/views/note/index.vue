<script lang="ts" setup>
import { computed } from 'vue'
import NoteMenu from './inner/NoteMenu.vue'
import NoteList from './inner/NoteList.vue'
import NoteView from './inner/NoteView.vue'
import NoteEmpty from './inner/NoteEmpty.vue'
import { useNoteStore } from '@/store'
import MobilePageHeader from '@/components/mobile/MobilePageHeader.vue'
import { useMobile } from '@/hooks/useMobile'

const noteStore = useNoteStore()
const { isMobile } = useMobile()
const currentLoadId = computed(() => noteStore.view.loadId)
</script>

<template>
  <!-- 移动端显示 -->
  <template v-if="isMobile">
    <MobilePageHeader title="笔记" />
    <div class="note-mobile-container">
      <section class="el-container height100">
        <aside class="el-aside note-aside-mobile">
          <NoteList />
        </aside>

        <main class="el-main note-main-mobile">
          <component :is="currentLoadId > 0 ? NoteView : NoteEmpty" />
        </main>
      </section>
    </div>
  </template>

  <!-- PC端显示 -->
  <template v-else>
    <section class="el-container height100">
      <aside class="el-aside" style="width: 230px">
        <NoteMenu />
      </aside>

      <aside
        class="el-aside"
        style="width: 280px"
        v-dropsize="{ min: 200, max: 500, direction: 'right' }"
      >
        <NoteList />
      </aside>

      <main class="el-main">
        <component :is="currentLoadId > 0 ? NoteView : NoteEmpty" />
      </main>
    </section>
  </template>
</template>

<style lang="less" scoped>
.note-mobile-container {
  height: 100%;
  overflow: hidden;

  .el-container {
    height: 100%;

    .note-aside-mobile {
      width: 100%;
      height: 100%;
      border-right: none;
      overflow-y: auto;
    }

    .note-main-mobile {
      display: none; // 移动端只显示笔记列表
    }
  }
}
</style>
