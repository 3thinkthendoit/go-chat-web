import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 移动端检测Hook
 * @returns {Ref<boolean>} 是否为移动端
 */
export function useMobile() {
  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return {
    isMobile
  }
}
