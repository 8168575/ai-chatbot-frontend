function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, collapsed }) {
  const groupByDate = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86_400_000;
    const sevenDaysAgo = today - 7 * 86_400_000;

    const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], Older: [] };

    items.forEach((conversation) => {
      const updatedAt = conversation.updatedAt;
      if (updatedAt >= today) groups.Today.push(conversation);
      else if (updatedAt >= yesterday) groups.Yesterday.push(conversation);
      else if (updatedAt >= sevenDaysAgo) groups["Previous 7 Days"].push(conversation);
      else groups.Older.push(conversation);
    });

    return groups;
  };

  const groups = groupByDate(conversations);
  const hasConversations = conversations.length > 0;

  return (
    <nav className={`sidebar${collapsed ? " collapsed" : ""}`} aria-label="Conversation history">
      <div className="sidebar-header">
        <div className="sidebar-brand-block">
          <span className="sidebar-logo">
            <span className="sidebar-logo-icon">H</span>
            <span className="sidebar-logo-wordmark">HFM Campus AI</span>
          </span>
          <p className="sidebar-brand-copy">
            High-focus messaging workspace with persistent threads and voice controls.
          </p>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNew} title="Start a new conversation">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New thread
      </button>

      <div className="conversation-list" role="list">
        {!hasConversations && (
          <p className="sidebar-empty-state">
            No threads yet. Start a new thread to begin working with HFM Campus AI.
          </p>
        )}

        {Object.entries(groups).map(([label, items]) =>
          items.length === 0 ? null : (
            <div key={label}>
              <p className="sidebar-section-label">{label}</p>
              {items.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conv={conversation}
                  isActive={conversation.id === activeId}
                  onSelect={() => onSelect(conversation.id)}
                  onDelete={(event) => {
                    event.stopPropagation();
                    onDelete(conversation.id);
                  }}
                />
              ))}
            </div>
          )
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-avatar">HF</div>
          <div className="sidebar-footer-meta">
            <span className="sidebar-footer-name">HFM Campus AI</span>
            <span className="sidebar-footer-role">Mistral-backed assistant</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function ConversationItem({ conv, isActive, onSelect, onDelete }) {
  return (
    <div
      className={`conversation-item${isActive ? " active" : ""}`}
      onClick={onSelect}
      role="listitem"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onSelect()}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="conversation-item-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>
      <span className="conversation-item-title" title={conv.title}>
        {conv.title}
      </span>
      <div className="conversation-item-actions">
        <button
          className="conversation-action-btn delete"
          onClick={onDelete}
          title="Delete conversation"
          aria-label={`Delete conversation: ${conv.title}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
