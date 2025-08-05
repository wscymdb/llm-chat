import type { Conversation } from '@ant-design/x';
import localforage from 'localforage';
import { create } from 'zustand';

localforage.config({
  name: 'llm-chat', // 数据库名称
  storeName: 'myStore', // 存储空间名称
});

interface LLMStoreState {
  curConversation: string;
  setCurConversation: (val: string) => void;
  conversations: Conversation[];
  initConversations: () => Promise<void>;
  getLocalConversations: () => Promise<Conversation[]>;
  setLocalConversation: (conversation: Conversation) => Promise<void>;
  setLocalConversations: (conversations: Conversation[]) => Promise<void>;
  removeLocalConversation: (key: string) => Promise<void>;
  onConversationChange: (key: string) => void;
  addMessages: (id: string, messages: any) => Promise<void>;
  getMessages: (id: string) => Promise<any>;
}

const useLLMStore = create<LLMStoreState>((set, get) => ({
  // active的会话
  curConversation: '',
  setCurConversation(val: string) {
    set({ curConversation: val });
  },

  // 会话列表
  conversations: [],

  async addMessages(id: string, messages: any) {
    try {
      await localforage.setItem(`message_${id}`, messages);
    } catch (error) {
      // 出错
      console.error('存储失败:', error);
    }
  },

  async getMessages(id: string) {
    try {
      const messages = await localforage.getItem(`message_${id}`);
      return messages || [];
    } catch (error) {
      // 出错
      console.error('获取会话列表失败conversations:', error);
      return [];
    }
  },

  // 初始化
  async initConversations() {
    const result = (await localforage.getItem<Conversation[]>('conversations')) || [];
    const curConversation = result[0]?.key || '';
    set({ conversations: result, curConversation });
  },

  // 获取会话列表
  async getLocalConversations() {
    try {
      const conversations = await localforage.getItem<Conversation[]>('conversations');
      return conversations || [];
    } catch (error) {
      // 出错
      console.error('获取会话列表失败conversations:', error);
      return [];
    }
  },

  // 存储单个会话
  async setLocalConversation(conversation: Conversation) {
    try {
      const state = get();
      const conversations = await state.getLocalConversations();
      const newConversations = [conversation, ...conversations];
      set({ conversations: newConversations });
      state.setCurConversation(conversation.key);
      await state.setLocalConversations(newConversations);
    } catch (error) {
      // 出错
      console.error('存储失败:', error);
    }
  },

  // 存储会话列表
  async setLocalConversations(conversations: Record<string, any>) {
    try {
      await localforage.setItem('conversations', conversations);
    } catch (error) {
      // 出错
      console.error('存储失败:', error);
    }
  },

  // 删除单个会话
  async removeLocalConversation(key: string) {
    try {
      const state = get();
      const conversations = await state.getLocalConversations();
      const newConversations = conversations.filter((item: any) => item.key !== key);
      set({ conversations: newConversations });
      state.setCurConversation(newConversations[0]?.key);
      await state.setLocalConversations(newConversations);
    } catch (error) {
      // 出错
      console.error('删除会话列表失败conversations:', error);
    }
  },

  onConversationChange(key: string) {
    set({ curConversation: key });
  },
}));

export default useLLMStore;
