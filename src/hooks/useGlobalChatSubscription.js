import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import {
  subscribeToInboundMessages,
  getMessageBannerInfo,
} from '../services/chatService';

// Subscribes to inbound messages for the current user as long as the user is
// logged in. Bumps the chat list (so ChatScreen refreshes), increments unread
// counts, and shows a banner unless the user is already viewing that thread.
export function useGlobalChatSubscription() {
  const userId = useAuthStore((s) => s.user?.id);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      useChatStore.getState().resetChatState();
      return undefined;
    }

    const unsubscribe = subscribeToInboundMessages(userId, async (msg) => {
      const { activeChatId, noteInbound, showBanner } = useChatStore.getState();
      noteInbound({ chatId: msg.chat_id });
      if (activeChatId === msg.chat_id) return;
      try {
        const info = await getMessageBannerInfo(msg);
        showBanner(info);
      } catch {
        showBanner({ chatId: msg.chat_id, text: msg.text, other: null });
      }
    });

    return unsubscribe;
  }, [isLoggedIn, userId]);
}
