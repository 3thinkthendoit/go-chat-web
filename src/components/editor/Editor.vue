<script lang="ts" setup>
import QuillEditor, { Quill, Delta } from '@/components/quill-editor'
import Emitter from 'quill/core/emitter.js'
import { reactive, watch, ref, markRaw, computed, onMounted, onUnmounted } from 'vue'
import { NPopover } from 'naive-ui'
import {
  Voice as IconVoice,
  SourceCode,
  SmilingFace,
  Pic,
  FolderUpload,
  Ranking,
  History
} from '@icon-park/vue-next'
import MeEditorVote from './MeEditorVote.vue'
import MeEditorEmoticon from './MeEditorEmoticon.vue'
import MeEditorCode from './MeEditorCode.vue'
import MeEditorRecorder from './MeEditorRecorder.vue'
import { useEditorDraftStore } from '@/store'
import {
  deltaToMessage,
  deltaToString,
  isEmptyDelta,
  onClipboardMatcher,
  onUploadImage
} from './util'
import { getImageInfo } from '@/utils/file'
import { EditorConst } from '@/constant/event-bus'
import { emitCall } from '@/utils/common'
import { defAvatar } from '@/constant/default'
import { useEventBus } from '@/hooks'

const emit = defineEmits(['editor-event'])
const editorDraftStore = useEditorDraftStore()
const props = defineProps({
  showVote: {
    type: Boolean,
    default: false
  },
  indexName: {
    type: String,
    default: ''
  },
  groupMembers: {
    default: () => []
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const editor = ref(null)
const isMobile = computed(() => props.isMobile)

const getQuill = () => {
  // @ts-ignore
  return editor?.value?.getQuill()
}

// 是否有输入内容（用于显示发送按钮或+号）
const hasContent = computed(() => {
  const quill = getQuill()
  if (!quill) return false
  const delta = quill.getContents()
  const text = deltaToString(delta)
  return text.trim().length > 0
})

// 点击输入框区域获取焦点
const focusInput = (event: Event) => {
  // 阻止事件冒泡，避免冲突
  event.stopPropagation()
  event.preventDefault()

  const quill = getQuill()
  if (quill) {
    // 直接调用 focus() 方法
    quill.focus()

    // 设置光标位置到文本末尾或开始
    const length = quill.getLength()

    if (length > 1) {
      quill.setSelection(length - 1, 0)
    } else {
      quill.setSelection(0, 0)
    }
  }
}

// 编辑器获得焦点
const onFocus = () => {
  console.log('Editor focused')
}

// 移动端动态调整输入框高度
const adjustEditorHeight = () => {
  if (!isMobile.value) return

  const quill = getQuill()
  if (!quill) return

  const editorEl = quill.root
  if (!editorEl) return

  // 横向布局模式：使用CSS控制的min-height和max-height
  // 这里只清空内联样式，让CSS生效
  editorEl.style.height = ''
}

const getQuillSelectionIndex = () => {
  let quill = getQuill()
  if (!quill) return 0

  return (quill.getSelection() || {}).index || quill.getLength()
}

const isShowEditorVote = ref(false)
const isShowEditorCode = ref(false)
const isShowEditorRecorder = ref(false)
const fileImageRef = ref()
const uploadFileRef = ref()
const emoticonRef = ref()

const editorOption = {
  theme: 'snow',
  placeholder: '',//按Enter发送 / Shift+Enter 换行
  modules: {
    toolbar: false,

    clipboard: {
      // 粘贴版，处理粘贴时候的自带样式
      matchers: [[Node.ELEMENT_NODE, onClipboardMatcher]]
    },

    keyboard: {
      bindings: {
        enter: {
          key: 'Enter',
          // 回车发送消息
          handler: onSendMessage
        }
      }
    },

    mention: {
      allowedChars: /^[\u4e00-\u9fa5]*$/,
      mentionDenotationChars: ['@'],
      positioningStrategy: 'fixed',
      renderItem: (data: any) => {
        const el = document.createElement('div')
        el.className = 'ed-member-item'
        el.innerHTML = `<img src="${data.avatar}" class="avator"/>`
        el.innerHTML += `<span class="nickname">${data.nickname}</span>`
        return el
      },
      source: function (searchTerm: string, render: any) {
        if (!props.groupMembers.length) return render([])

        const items = [
          { id: 0, nickname: '所有人', avatar: defAvatar, value: '所有人' },
          ...props.groupMembers
        ]

        render(items.filter((item: any) => item.nickname.toLowerCase().indexOf(searchTerm) !== -1))
      },

      mentionContainerClass: 'ql-mention-list-container me-scrollbar me-scrollbar-thumb'
    },

    uploader: {
      mimetypes: ['image/webp', 'image/gif', 'image/png', 'image/jpg', 'image/jpeg'],
      handler(range: any, files: File[]) {
        // @ts-ignore
        let quill = this.quill

        if (!quill.scroll.query('image')) return

        const promises = files.map((file) => {
          return onUploadImage(file)
        })

        Promise.all(promises).then((images) => {
          const update = images.reduce((delta: any, image) => {
            return delta.insert({ image })
          }, new Delta().retain(range.index).delete(range.length))

          quill.updateContents(update, Emitter.sources.USER)
          quill.setSelection(range.index + images.length, Emitter.sources.SILENT)
        })
      }
    }
  }
}

const navs = reactive([
  {
    title: '图片',
    icon: markRaw(Pic),
    show: true,
    click: () => {
      fileImageRef.value.click()
    }
  },
  {
    title: '附件',
    icon: markRaw(FolderUpload),
    show: true,
    click: () => {
      uploadFileRef.value.click()
    }
  },
  {
    title: '代码',
    icon: markRaw(SourceCode),
    show: true,
    click: () => {
      isShowEditorCode.value = true
    }
  },
  {
    title: '语音消息',
    icon: markRaw(IconVoice),
    show: true,
    click: () => {
      isShowEditorRecorder.value = true
    }
  },
  {
    title: '群投票',
    icon: markRaw(Ranking),
    show: computed(() => props.showVote),
    click: () => {
      isShowEditorVote.value = true
    }
  },
  {
    title: '历史记录',
    icon: markRaw(History),
    show: true,
    click: () => {
      emit(
        'editor-event',
        emitCall('history_event', {}, () => {})
      )
    }
  }
])

function onVoteEvent(data: any) {
  const msg = emitCall('vote_event', data, (ok: boolean) => {
    if (ok) {
      isShowEditorVote.value = false
    }
  })

  emit('editor-event', msg)
}

function onEmoticonEvent(data: any) {
  emoticonRef.value.setShow(false)

  if (data.type == 1) {
    const quill = getQuill()
    let index = getQuillSelectionIndex()

    if (index == 1 && quill.getLength() == 1 && quill.getText(0, 1) == '\n') {
      quill.deleteText(0, 1)
      index = 0
    }

    if (data.img) {
      quill.insertEmbed(index, 'emoji', {
        alt: data.value,
        src: data.img,
        width: '24px',
        height: '24px'
      })
    } else {
      quill.insertText(index, data.value)
    }

    quill.setSelection(index + 1, 0, 'user')
  } else {
    let fn = emitCall('emoticon_event', data.value, () => {})
    emit('editor-event', fn)
  }
}

function onCodeEvent(data: any) {
  const msg = emitCall('code_event', data, () => {
    isShowEditorCode.value = false
  })

  emit('editor-event', msg)
}

async function onUploadFile(e: any) {
  if (!e.target.files) return

  const file = e.target.files[0]

  e.target.value = null

  if (file.type.indexOf('image/') === 0) {
    const quill = getQuill()
    let index = getQuillSelectionIndex()

    if (index == 1 && quill.getLength() == 1 && quill.getText(0, 1) == '\n') {
      quill.deleteText(0, 1)
      index = 0
    }

    let src = await onUploadImage(file)
    if (src) {
      quill.insertEmbed(index, 'image', src)
      quill.setSelection(index + 1)
    }

    return
  }

  if (file.type.indexOf('video/') === 0) {
    let fn = emitCall('video_event', file, () => {})
    emit('editor-event', fn)
  } else {
    let fn = emitCall('file_event', file, () => {})
    emit('editor-event', fn)
  }
}

function onRecorderEvent(file: any) {
  emit('editor-event', emitCall('file_event', file))
  isShowEditorRecorder.value = false
}

function onSendMessage() {
  let delta = getQuill().getContents()
  let data = deltaToMessage(delta)

  if (data.items.length === 0) return

  switch (data.msgType) {
    case 1: // 文字消息
      if (data.items[0].content.length > 1024) {
        return window['$message'].info('发送内容超长，请分条发送')
      }

      emit(
        'editor-event',
        emitCall('text_event', data, (ok: any) => {
          ok && getQuill().setContents([], Quill.sources.USER)
        })
      )
      break
    case 3: // 图片消息
      emit(
        'editor-event',
        emitCall(
          'image_event',
          { ...getImageInfo(data.items[0].content), url: data.items[0].content, size: 10000 },
          (ok: any) => {
            ok && getQuill().setContents([])
          }
        )
      )
      break
    case 12: // 图文消息
      emit(
        'editor-event',
        emitCall('mixed_event', data, (ok: any) => {
          ok && getQuill().setContents([])
        })
      )
      break
  }
}

function onEditorChange() {
  const delta: any = getQuill().getContents()

  const text = deltaToString(delta)

  if (!isEmptyDelta(delta)) {
    editorDraftStore.items[props.indexName || ''] = JSON.stringify({
      text: text,
      ops: delta.ops
    })
  } else {
    // 删除 editorDraftStore.items 下的元素
    delete editorDraftStore.items[props.indexName || '']
  }

  emit('editor-event', emitCall('input_event', text))
  
  // 移动端动态调整输入框高度
  if (isMobile.value) {
    adjustEditorHeight()
  }
}

function loadEditorDraftText() {
  // 这里延迟处理，不然会有问题
  setTimeout(() => {
    hideMentionDom()

    const quill = getQuill()

    if (!quill) return

    // 从缓存中加载编辑器草稿
    let draft = editorDraftStore.items[props.indexName || '']
    if (draft) {
      quill.setContents(JSON.parse(draft)?.ops || [])
    } else {
      quill.setContents([])
    }

    quill.setSelection(getQuillSelectionIndex(), 0, 'user')
  }, 10)
}

function onSubscribeMention(data: { id: number; value: string }) {
  const quill = getQuill()

  // @ts-ignore
  const mention = quill.getModule('mention')

  // @ts-ignore
  mention.mentionCharPos = quill.getSelection()?.index ?? quill.getLength()

  // @ts-ignore
  mention.insertItem({ id: data?.id, denotationChar: '@', value: data.value }, false)
}

function onSubscribeQuote(data: any) {
  const delta = getQuill().getContents()
  if (delta.ops?.some((item: any) => item.insert.quote)) {
    return
  }

  const quill = getQuill()
  const index = getQuillSelectionIndex()

  quill.insertEmbed(0, 'quote', data)
  quill.setSelection(index + 1, 0, 'user')
}

function hideMentionDom() {
  let el = document.querySelector('.ql-mention-list-container')
  el && el.remove()
}

watch(() => props.indexName, loadEditorDraftText, { immediate: true })

onMounted(() => {
  loadEditorDraftText()
})

onUnmounted(() => {
  hideMentionDom()
})

useEventBus([
  { name: EditorConst.Mention, event: onSubscribeMention },
  { name: EditorConst.Quote, event: onSubscribeQuote }
])
</script>

<template>
  <section :class="['editor', { 'editor-mobile': isMobile }]">
    <form enctype="multipart/form-data" style="display: none">
      <input type="file" ref="fileImageRef" accept="image/*" @change="onUploadFile" />
      <input type="file" ref="uploadFileRef" @change="onUploadFile" />
    </form>

    <!-- PC端: 工具栏在上方，输入框在下方 -->
    <template v-if="!isMobile">
      <header class="el-header toolbar border-top">
        <n-popover
          placement="top-start"
          trigger="click"
          raw
          :width="300"
          ref="emoticonRef"
          style="width: 500px; height: 250px; border-radius: 10px; overflow: hidden"
        >
          <template #trigger>
            <div class="toolbar-item">
              <n-icon size="18" class="icon" :component="SmilingFace" />
              <p class="title">表情符号</p>
            </div>
          </template>

          <MeEditorEmoticon @on-select="onEmoticonEvent" />
        </n-popover>

        <div
          class="toolbar-item"
          v-for="nav in navs"
          :key="nav.title"
          v-show="nav.show"
          @click="nav.click"
        >
          <n-icon size="18" class="icon" :component="nav.icon" />
          <p class="title">{{ nav.title }}</p>
        </div>
      </header>

      <main class="el-main">
        <QuillEditor
          ref="editor"
          :options="editorOption"
          @change="onEditorChange"
          style="height: 70%"
          @send-click="onSendMessage"
        />
      </main>
    </template>

    <!-- 移动端: 表情按钮 - 输入框 - 图片按钮 - 发送按钮（横向布局） -->
    <template v-else>
      <div class="mobile-editor-container">
        <!-- 表情按钮 -->
        <div class="mobile-toolbar-left">
          <n-popover
            placement="top"
            trigger="click"
            raw
            :width="320"
            ref="emoticonRef"
            style="width: 100%; max-width: 400px; height: 280px; border-radius: 10px; overflow: hidden"
          >
            <template #trigger>
              <div class="mobile-toolbar-btn">
                <n-icon size="24" :component="SmilingFace" />
              </div>
            </template>
            <MeEditorEmoticon @on-select="onEmoticonEvent" />
          </n-popover>
        </div>

        <!-- 输入框 -->
        <div class="mobile-input-wrapper" @click.stop="focusInput">
          <QuillEditor
            ref="editor"
            :options="editorOption"
            @change="onEditorChange"
            @send-click="onSendMessage"
            @focus="onFocus"
          />
        </div>

        <!-- 右侧按钮组：图片、发送 -->
        <div class="mobile-toolbar-right">
          <!-- 图片按钮 -->
          <div class="mobile-toolbar-btn" @click="fileImageRef.click()">
            <n-icon size="24" :component="Pic" />
          </div>

          <!-- 发送按钮 -->
          <div
            class="mobile-send-btn"
            @click="onSendMessage"
          >
            <span>Send</span>
          </div>
        </div>
      </div>
    </template>
  </section>

  <MeEditorVote v-if="isShowEditorVote" @close="isShowEditorVote = false" @submit="onVoteEvent" />

  <MeEditorCode
    v-if="isShowEditorCode"
    @on-submit="onCodeEvent"
    @close="isShowEditorCode = false"
  />

  <MeEditorRecorder
    v-if="isShowEditorRecorder"
    @on-submit="onRecorderEvent"
    @close="isShowEditorRecorder = false"
  />
</template>

<style lang="less" scoped>
.editor {
  --tip-bg-color: rgb(241 241 241 / 90%);

  height: 100%;
  display: flex;
  flex-direction: column;

  &.editor-mobile {
    height: auto !important;
    min-height: 52px !important;
  }

  .toolbar {
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 5px;
    background-color: #f5f5f5;

    .toolbar-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin: 0 2px;
      position: relative;
      user-select: none;
      cursor: pointer;
      color: #000;

      .icon {
        color: #000;
      }

      .title {
        display: none;
        position: absolute;
        top: 40px;
        left: 0px;
        line-height: 26px;
        background-color: var(--tip-bg-color);
        color: var(--im-text-color);
        min-width: 20px;
        font-size: 12px;
        padding: 0 5px;
        border-radius: 2px;
        white-space: pre;
        user-select: none;
        z-index: 999999999999;
      }

      &:hover .title {
        display: block;
      }
    }
  }
}

// 移动端编辑器样式（微信风格横向布局）
@media screen and (max-width: 768px) {
  .editor:not(.editor-mobile) {
    // PC端样式保持不变
  }

  .editor-mobile {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 52px !important;

    .mobile-editor-container {
      width: 100% !important;
      display: flex !important;
      align-items: flex-end !important;
      gap: 6px !important;
      padding: 8px !important;
      background-color: #e8e8e8 !important;
      border-top: 1px solid #e5e5e5 !important;
      height: auto !important;
      min-height: 52px !important;

      // 左侧工具栏（表情）
      .mobile-toolbar-left {
        width: 40px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      // 输入框（中间，自适应）
      .mobile-input-wrapper {
        flex: 1 1 auto !important;
        min-width: 100px;
        min-height: 40px;
        display: flex;
        align-items: stretch;

        .ql-container {
          width: 100%;
          min-height: 40px;
          background-color: #ffffff;
        }

        .ql-editor {
          // 微信风格输入框
          background-color: #ffffff;
          border-radius: 6px;
          font-size: 14px; // 调小字体大小
          line-height: 1.5;
          padding: 8px 12px;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          box-shadow: none;
          margin: 0;
          width: 100%;
          height: auto;

          // 占位符样式
          &.ql-blank::before {
            color: #b0b0b0;
            font-size: 16px;
          }
        }

        .ql-container.ql-snow {
          border: none;
        }

        // 隐藏滚动条
        .ql-editor::-webkit-scrollbar {
          width: 0;
          display: none;
        }
      }

      // 右侧工具栏（图片、发送）
      .mobile-toolbar-right {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      // 工具栏按钮
      .mobile-toolbar-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        color: #333;
        background-color: transparent;
        transition: all 0.2s ease;

        &:active {
          opacity: 0.6;
          transform: scale(0.95);
        }

        .n-icon {
          color: #333;
        }
      }

      // 发送按钮
      .mobile-send-btn {
        width: 60px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        background-color: rgb(24, 144, 255);
        color: #ffffff;

        &:active {
          opacity: 0.8;
          transform: scale(0.95);
        }
      }
    }
  }
}

html[theme-mode='dark'] {
  .editor {
    --tip-bg-color: #48484d;
  }
}
</style>

<style lang="less">
.ql-container.ql-snow {
  border: unset;
}

.ql-editor {
  padding: 10px 12px;
  border: unset;
  font-size: 14px;
  line-height: 1.6;
  background-color: #ffffff;
  border-radius: 6px;
  min-height: 36px;

  &::-webkit-scrollbar {
    width: 3px;
    height: 3px;
    background-color: unset;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: transparent;
  }

  &:hover {
    &::-webkit-scrollbar-thumb {
      background-color: var(--im-scrollbar-thumb);
    }
  }
}

.ql-editor.ql-blank::before {
  font-family:
    PingFang SC,
    Microsoft YaHei,
    'Alibaba PuHuiTi 2.0 45' !important;
  left: 12px;
  font-style: normal;
  color: #999;
}

// 移动端输入框样式（微信风格，覆盖全局样式）
@media screen and (max-width: 768px) {
  .editor-mobile .mobile-input-wrapper .ql-container {
    width: 100% !important;
    height: auto !important;
    min-height: 40px !important;
  }

  .editor-mobile .mobile-input-wrapper .ql-editor {
    background-color: #ffffff !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    padding: 8px 12px !important;
    min-height: 40px !important;
    max-height: 120px !important;
    margin: 0 !important;
    width: 100% !important;
    height: auto !important;
    box-sizing: border-box !important;
    display: block !important;

    &.ql-blank::before {
      color: #b0b0b0 !important;
      font-size: 16px !important;
    }

    &::-webkit-scrollbar {
      width: 0 !important;
      display: none !important;
    }
  }

  .editor-mobile .mobile-input-wrapper .ql-container.ql-snow {
    border: none !important;
    background-color: #ffffff !important;
    height: auto !important;
    min-height: 40px !important;
    border-radius: 6px !important;
  }

  .editor-mobile .mobile-input-wrapper {
    flex: 1 !important;
    min-width: 100px !important;
    background-color: #e8e8e8 !important;
    padding: 0 !important;
    position: relative !important;
    z-index: 1 !important;
    height: auto !important;
    min-height: 40px !important;
    border-radius: 6px !important;
    cursor: text !important;
  }

  // 确保 quill-editor 容器铺满 wrapper
  .editor-mobile .mobile-input-wrapper .quill-editor {
    width: 100% !important;
    height: auto !important;
    display: flex !important;
    position: relative !important;
  }

  // 确保第一个 section（实际的编辑器）铺满
  .editor-mobile .mobile-input-wrapper .quill-editor section:first-child {
    width: 100% !important;
    height: auto !important;
  }

  // 确保编辑器获得焦点时显示光标
  .editor-mobile .mobile-input-wrapper .ql-editor:focus {
    outline: none !important;
    background-color: #ffffff !important;
  }

  .editor-mobile .mobile-input-wrapper .ql-editor.ql-focused {
    outline: none !important;
    background-color: #ffffff !important;
  }

  // 确保空状态下也有光标
  .editor-mobile .mobile-input-wrapper .ql-editor.ql-blank:focus::before {
    display: none !important;
  }

  // 确保光标正确显示
  .editor-mobile .mobile-input-wrapper .ql-editor .ql-cursor {
    display: inline-block !important;
    width: 2px !important;
    background-color: #000 !important;
  }

  // 强制显示光标
  .editor-mobile .mobile-input-wrapper .ql-container.ql-snow .ql-editor {
    caret-color: #000 !important;
    min-height: 40px !important;
    max-height: 120px !important;
    height: auto !important;
  }

  // 空状态下强制显示光标
  .editor-mobile .mobile-input-wrapper .ql-editor.ql-blank.ql-focused {
    caret-color: #000 !important;
  }

  .editor-mobile .mobile-editor-container {
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    align-items: flex-end !important;
    gap: 6px !important;
    padding: 8px !important;
    background-color: #e8e8e8 !important;
    border-top: 1px solid #e5e5e5 !important;
    height: auto !important;
    min-height: 52px !important;
  }

  .editor-mobile .mobile-toolbar-left {
    width: 40px !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
  }

  .editor-mobile .mobile-input-wrapper {
    flex: 1 !important;
    min-width: 100px !important;
    min-height: 40px !important;
    display: flex !important;
    align-items: flex-end !important;
  }

  .editor-mobile .mobile-toolbar-right {
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  .editor-mobile .mobile-toolbar-btn {
    width: 40px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    color: #333 !important;
    background-color: transparent !important;
    transition: all 0.2s ease !important;

    &:active {
      opacity: 0.6 !important;
      transform: scale(0.95) !important;
    }

    .n-icon {
      color: #333 !important;
    }
  }

  .editor-mobile .mobile-send-btn {
    width: 70px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 4px !important;
    font-size: 15px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    user-select: none !important;
    background-color: rgb(24, 144, 255) !important;
    color: #ffffff !important;

    &:active {
      opacity: 0.8 !important;
      transform: scale(0.95) !important;
    }
  }
}

.ql-snow .ql-editor img {
  max-width: 100px;
  border-radius: 3px;
  background-color: #48484d;
  margin: 0px 2px;
}

.ed-emoji {
  background-color: unset !important;
}

.ql-editor.ql-blank::before {
  font-style: unset;
  color: #b8b3b3;
}

.quote-card-content {
  display: flex;
  background-color: #f6f6f6;
  flex-direction: column;
  padding: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  user-select: none;

  .quote-card-title {
    height: 22px;
    line-height: 22px;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    justify-content: space-between;

    .quote-card-remove {
      margin-right: 5px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      transition: all 0.3s;
    }
  }

  &:hover .quote-card-title .quote-card-remove {
    font-size: 30px;
  }

  .quote-card-meta {
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

html[theme-mode='dark'] {
  .ql-editor.ql-blank::before {
    color: #57575a;
  }

  .quote-card-content {
    background-color: var(--im-message-bg-color);
  }
}
</style>
