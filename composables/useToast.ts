// Tiny global toast. One message at a time, auto-dismisses.
interface ToastState {
  message: string
  visible: boolean
}

export function useToast() {
  const state = useState<ToastState>('toast', () => ({
    message: '',
    visible: false,
  }))
  let timer: ReturnType<typeof setTimeout> | null = null

  function show(message: string, ms = 2200) {
    state.value = { message, visible: true }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      state.value = { ...state.value, visible: false }
    }, ms)
  }

  return { state, show }
}
