import Base from './base'
import { useDialogueStore, useTalkStore } from '@/store'
import { parseTime } from '@/utils/datetime'

/**
 * 好友状态事件
 */
class Revoke extends Base {
  /**
   * @var resource 资源
   */
  resource: any

  /**
   * 发送者ID
   */
  sender_id: number = 0

  /**
   * 接收者ID
   */
  receiver_id: number = 0

  /**
   * 聊天类型[1:私聊;2:群聊;]
   */
  talk_type: number = 0

  /**
   * 消息ID
   */
  msg_id: number = 0

  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor(resource: any) {
    super()

    this.resource = resource
    this.sender_id = resource.sender_id
    this.receiver_id = resource.receiver_id
    this.talk_type = resource.talk_type
    this.msg_id = resource.msg_id

    this.handle()
  }

  /**
   * 判断消息发送者是否来自于我
   * @returns
   */
  isCurrSender(): boolean {
    return this.sender_id == this.getAccountId()
  }

  /**
   * 获取对话索引
   *
   * @return String
   */
  getIndexName(): string {
    if (this.talk_type == 2) {
      return `${this.talk_type}_${this.receiver_id}`
    }

    const receiver_id = this.isCurrSender() ? this.receiver_id : this.sender_id

    return `${this.talk_type}_${receiver_id}`
  }

  handle() {
    const indexName = this.getIndexName()
    console.log('[Revoke] indexName:', indexName)
    console.log('[Revoke] msg_id:', this.msg_id)
    console.log('[Revoke] resource:', this.resource)

    // 更新对话记录为撤回状态
    useDialogueStore().updateDialogueRecord({
      msg_id: this.msg_id,
      is_revoked: 1
    })

    // 获取当前对话记录
    const dialogueStore = useDialogueStore()
    const records = dialogueStore.records

    console.log('[Revoke] records count:', records.length)
    if (records.length > 0) {
      console.log('[Revoke] last msg_id:', records[records.length - 1].msg_id)
    }

    // 判断撤回的消息是否是最后一条消息
    const isLastMessage = records.length > 0 &&
      String(records[records.length - 1].msg_id) === String(this.msg_id)

    console.log('[Revoke] isLastMessage:', isLastMessage)

    // 无论是否在当前对话窗口，只要撤回的是最后一条消息，就更新左侧列表
    if (isLastMessage) {
      const revokeText = this.resource.text || (this.isCurrSender() ? '你撤回了一条消息' : '对方撤回了一条消息')

      console.log('[Revoke] Updating left sidebar with:', revokeText)

      useTalkStore().updateItem({
        index_name: indexName,
        msg_text: revokeText,
        updated_at: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}') as string
      })

      // 验证更新
      const talkItem = useTalkStore().findItem(indexName)
      console.log('[Revoke] Updated talkItem msg_text:', talkItem?.msg_text)
    } else {
      console.log('[Revoke] Not last message, skipping left sidebar update')
    }
  }
}

export default Revoke
