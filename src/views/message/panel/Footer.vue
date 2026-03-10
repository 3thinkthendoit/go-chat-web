<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import {
  useTalkStore,
  useDialogueStore,
  useSettingsStore,
  useUploadsStore,
  useEditorStore,
  useUserStore
} from '@/store'
import ws from '@/connect'
import { ServePublishMessage } from '@/api/chat'
import { ServeGroupVoteCreate } from '@/api/group'
import { throttle } from '@/utils/common'
import { getVideoImage } from '@/utils/file'
import Editor from '@/components/editor/Editor.vue'
import MultiSelectFooter from './MultiSelectFooter.vue'
import HistoryRecord from '@/components/talk/HistoryRecord.vue'
import { ServeUploadImage } from '@/api/upload'
import { toApi } from '@/api'
import { bus } from '@/utils'
import { Crypto } from '@/utils/crypto'

const talkStore = useTalkStore()
const editorStore = useEditorStore()
const settingsStore = useSettingsStore()
const uploadsStore = useUploadsStore()
const dialogueStore = useDialogueStore()
const userStore = useUserStore()
const props = defineProps({
  uid: {
    type: Number,
    default: 0
  },
  talkMode: {
    type: Number,
    default: 0
  },
  toFromId: {
    type: Number,
    default: 0
  },
  indexName: {
    type: String,
    default: ''
  },
  online: {
    type: Boolean,
    default: false
  },
  members: {
    default: () => []
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const isShowHistory = ref(false)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const el = document.getElementById('imChatPanel')
    if (el) {
      el.scrollTop = el.scrollHeight
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 50)
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 150)
    }
  })
}

const onSendMessage = async (data = {}, callBack: any) => {
  const params = {
    ...data,
    talk_mode: props.talkMode,
    to_from_id: props.toFromId
  }

  // 如果是文本消息，先显示在对话框中
  if (data.type === 'text') {
    // 生成临时消息ID
    const tempMsgId = 'temp_' + Date.now()

    // 使用明文显示，而不是密文
    const displayContent = data.plaintext || data.body.text

    // 先在对话框中显示消息（发送中状态）
    dialogueStore.records.push({
      msg_id: tempMsgId,
      msg_type: 1,
      user_id: props.uid,
      nickname: userStore.nickname || '我',
      avatar: userStore.avatar || '',
      float: 'right',
      is_sending: true,
      is_temp: true, // 标记为临时消息
      send_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      extra: {
        content: displayContent
      },
      quote: null
    })

    // 滚动到底部
    scrollToBottom()

    // 调用API发送消息
    const { code, data: responseData } = await toApi(ServePublishMessage, params)

    if (code == 200) {
      // 发送成功，保留临时消息标记，等待Socket推送真实消息后替换
      // 不删除临时消息，避免抖动
      callBack(true)
    } else {
      // 发送失败，更新状态为失败
      const item = dialogueStore.records.find(r => r.msg_id === tempMsgId)
      if (item) {
        item.is_sending = false
        item.is_failed = true
        item.is_temp = false
      }
      callBack(false)
    }
  } else {
    // 其他类型消息保持原有逻辑
    const { code } = await toApi(ServePublishMessage, params)
    callBack(code == 200)
  }
}

// 发送文本消息
const onSendTextEvent = throttle((value: any) => {
  const { data, callBack } = value
  const text = data.items[0].content
  const msg = Crypto.AES.encrypt(text)
  const message = {
    type: 'text',
    quote_id: data.quoteId,
    body: {
      text: msg,
      mentions: data.mentionUids
    },
    plaintext: text // 添加明文字段用于发送时显示
  }
  onSendMessage(message, (ok: boolean) => {
    ok && callBack(true)
  })
}, 1000)

// 发送图片消息
const onSendImageEvent = async ({ data, callBack }) => {
  // 生成临时消息ID
  const tempMsgId = 'temp_' + Date.now()

  // 先在对话框中显示图片消息（发送中状态）
  dialogueStore.records.push({
    msg_id: tempMsgId,
    msg_type: 3,
    user_id: props.uid,
    nickname: userStore.nickname || '我',
    avatar: userStore.avatar || '',
    float: 'right',
    is_sending: true,
    is_temp: true, // 标记为临时消息
    send_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    extra: {
      url: data.url,
      width: data.width,
      height: data.height,
      name: data.name,
      size: data.size
    },
    quote: null
  })

  // 滚动到底部
  scrollToBottom()

  const message = {
    type: 'image',
    body: { ...data }
  }

  const { code } = await toApi(ServePublishMessage, {
    ...message,
    talk_mode: props.talkMode,
    to_from_id: props.toFromId
  })

  if (code == 200) {
    // 发送成功，保留临时消息，等待Socket推送真实消息后替换
    callBack(true)
  } else {
    // 发送失败，更新状态
    const item = dialogueStore.records.find(r => r.msg_id === tempMsgId)
    if (item) {
      item.is_sending = false
      item.is_failed = true
      item.is_temp = false
    }
    callBack(false)
  }
}

// 发送图片消息
const onSendVideoEvent = async ({ data }) => {
  const resp = await getVideoImage(data)

  const coverForm = new FormData()
  coverForm.append('file', resp.file)

  const cover = await toApi(ServeUploadImage, coverForm)
  if (cover.code != 200) return

  const form = new FormData()
  form.append('file', data)

  const video = await toApi(ServeUploadImage, form)
  if (video.code != 200) return

  const message = {
    type: 'video',
    body: {
      url: video.data.src,
      cover: cover.data.src,
      duration: parseInt(`${resp.duration}`),
      size: data.size
    }
  }

  onSendMessage(message, () => {})
}

// 发送代码消息
const onSendCodeEvent = ({ data, callBack }) => {
  const message = {
    type: 'code',
    body: {
      code: data.code,
      lang: data.lang
    }
  }

  onSendMessage(message, callBack)
}

// 发送文件消息
const onSendFileEvent = ({ data }) => {
  let maxsize = 200 * 1024 * 1024
  if (data.size > maxsize) {
    return window['$message'].warning('上传文件不能超过100M!')
  }

  uploadsStore.initUploadFile(data, props.talkMode, props.toFromId, dialogueStore.talk.username)
}

// 发送投票消息
const onSendVoteEvent = ({ data, callBack }) => {
  let response = ServeGroupVoteCreate({
    group_id: props.toFromId,
    mode: data.mode,
    is_anonymous: data.is_anonymous,
    title: data.title,
    options: data.options
  })

  response.then(({ code, message }) => {
    if (code == 200) {
      callBack(true)
    } else {
      window['$message'].warning(message)
    }
  })

  response.catch(() => callBack(false))
}

// 发送表情消息
const onSendEmoticonEvent = ({ data, callBack }) => {
  const message = {
    type: 'emoticon',
    body: {
      emoticon_id: data
    }
  }

  onSendMessage(message, callBack)
}

const onSendMixedEvent = ({ data, callBack }) => {
  const message = {
    type: 'mixed',
    quote_id: data.quoteId,
    body: {
      items: data.items
    }
  }

  onSendMessage(message, callBack)
}

const onKeyboardPush = throttle(() => {
  ws.emit('im.message.keyboard', {
    to_from_id: props.toFromId
  })
}, 3000)

// 编辑器输入事件
const onInputEvent = ({ data }) => {
  talkStore.updateItem({
    index_name: props.indexName,
    draft_text: data
  })

  // 判断对方是否在线和是否需要推送
  // 3秒时间内推送一次
  if (settingsStore.isKeyboard && props.online) {
    onKeyboardPush()
  }
}

// 注册事件
const evnets = {
  text_event: onSendTextEvent,
  image_event: onSendImageEvent,
  video_event: onSendVideoEvent,
  code_event: onSendCodeEvent,
  file_event: onSendFileEvent,
  input_event: onInputEvent,
  vote_event: onSendVoteEvent,
  emoticon_event: onSendEmoticonEvent,
  history_event: () => {
    isShowHistory.value = true
  },
  mixed_event: onSendMixedEvent
}

// 编辑器事件
const onEditorEvent = (msg: any) => {
  evnets[msg.event] && evnets[msg.event](msg)

  !['history_event', 'input_event'].includes(msg.event) &&
    bus.emit('talk-session-scroll', { top: 0 })
}

onMounted(() => {
  editorStore.loadUserEmoticon()
})
</script>

<template>
  <footer class="el-footer">
    <MultiSelectFooter v-if="dialogueStore.isOpenMultiSelect" />
    <Editor
      v-else
      @editor-event="onEditorEvent"
      :index-name="indexName"
      :show-vote="talkMode == 2"
      :group-members="members"
      :is-mobile="isMobile"
    />
  </footer>

  <HistoryRecord
    v-if="isShowHistory"
    :talk-mode="talkMode"
    :to-from-id="toFromId"
    @close="isShowHistory = false"
  />
</template>

<style lang="less" scoped>
.el-footer {
  height: auto !important;
  min-height: 52px !important;

  @media screen and (max-width: 768px) {
    // 移动端自适应
    min-height: 52px !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
  }

  @media screen and (min-width: 769px) {
    // PC端固定高度
    height: 160px !important;
  }
}
</style>
