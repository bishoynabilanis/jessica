import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'xp' | 'levelup'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  xp?: number
}

interface UIState {
  toasts: Toast[]
  quickPanel: boolean
  palette: boolean
  pushToast: (toast: Omit<Toast, 'id'> & { duration?: number }) => string
  dismiss: (id: string) => void
  toggleQuickPanel: (open?: boolean) => void
  setPalette: (open: boolean) => void
}

export const useUI = create<UIState>((set, get) => ({
  toasts: [],
  quickPanel: false,
  palette: false,
  pushToast: (toast) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set((state) => ({ toasts: [...state.toasts.slice(-3), { ...toast, id }] }))
    const duration = toast.duration ?? (toast.type === 'levelup' ? 5200 : 3600)
    window.setTimeout(() => get().dismiss(id), duration)
    return id
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  toggleQuickPanel: (open) => set((state) => ({ quickPanel: open ?? !state.quickPanel })),
  setPalette: (open) => set({ palette: open }),
}))
