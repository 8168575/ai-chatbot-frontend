import { useCallback, useState } from "react";

const STORAGE_KEY = "hfm_conversations";
const LEGACY_STORAGE_KEYS = ["campusai_conversations"];

const load = () => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      return JSON.parse(current);
    }

    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }

    return [];
  } catch {
    return [];
  }
};

const save = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage may be unavailable.
  }
};

const deriveTitle = (messages) => {
  const first = messages.find((message) => message.role === "user");
  if (!first) return "New thread";
  const text = first.text.trim();
  return text.length > 52 ? text.slice(0, 52) + "..." : text;
};

const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function useConversations() {
  const [conversations, setConversations] = useState(() => load());
  const [activeId, setActiveId] = useState(() => {
    const stored = load();
    return stored.length > 0 ? stored[0].id : null;
  });

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? null;

  const createConversation = useCallback(() => {
    const nextConversation = {
      id: uuid(),
      title: "New thread",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((previous) => {
      const updated = [nextConversation, ...previous];
      save(updated);
      return updated;
    });

    setActiveId(nextConversation.id);
    return nextConversation;
  }, []);

  const updateMessages = useCallback(
    (newMessages) => {
      setConversations((previous) => {
        const updated = previous.map((conversation) => {
          if (conversation.id !== activeId) {
            return conversation;
          }

          return {
            ...conversation,
            messages: newMessages,
            title: deriveTitle(newMessages),
            updatedAt: Date.now(),
          };
        });

        save(updated);
        return updated;
      });
    },
    [activeId]
  );

  const selectConversation = useCallback((id) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      setConversations((previous) => {
        const updated = previous.filter((conversation) => conversation.id !== id);
        save(updated);

        if (id === activeId) {
          setActiveId(updated.length > 0 ? updated[0].id : null);
        }

        return updated;
      });
    },
    [activeId]
  );

  return {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateMessages,
    selectConversation,
    deleteConversation,
  };
}
