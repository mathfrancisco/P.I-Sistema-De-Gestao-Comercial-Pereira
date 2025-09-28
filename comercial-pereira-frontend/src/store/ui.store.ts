import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  loading: boolean
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleDarkMode: () => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  loading: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setLoading: (loading) => set({ loading }),
}))