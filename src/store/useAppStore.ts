import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface AppState {
  currentMode: string;
  activeSection: string;
  selectedTool: string | null;
  chatHistory: Message[];
  isSidebarOpen: boolean;

  setActiveSection: (id: string) => void;
  setSelectedTool: (tool: string) => void;
  setCurrentMode: (mode: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentMode: 'marketing',
  activeSection: 'hero',
  selectedTool: null,
  chatHistory: [],
  isSidebarOpen: false,

  setActiveSection: (id) => set({ activeSection: id }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setCurrentMode: (mode) => set({ currentMode: mode }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  addMessage: (msg) =>
    set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),
  clearChat: () => set({ chatHistory: [] }),
}));
