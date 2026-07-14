import { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import { useConversations } from "./hooks/useConversations.js";

function App() {
  const {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateMessages,
    selectConversation,
    deleteConversation,
  } = useConversations();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNew = () => {
    createConversation();
    setMobileOpen(false);
  };

  const handleSelect = (id) => {
    selectConversation(id);
    setMobileOpen(false);
  };

  const toggleSidebar = () => {
    const isMobile = window.innerWidth <= 720;
    if (isMobile) {
      setMobileOpen((value) => !value);
    } else {
      setSidebarCollapsed((value) => !value);
    }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 720;
  const effectiveCollapsed = isMobile ? !mobileOpen : sidebarCollapsed;

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <div
        className={`sidebar-overlay${mobileOpen ? " visible" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNew={handleNew}
        onSelect={handleSelect}
        onDelete={deleteConversation}
        collapsed={effectiveCollapsed}
      />

      <main className="chat-panel" role="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle-btn"
              onClick={toggleSidebar}
              aria-label={effectiveCollapsed ? "Open sidebar" : "Close sidebar"}
              title="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="topbar-brand">
              <span className="topbar-brand-name">HFM Campus AI</span>
              <span className="topbar-brand-sub">Focused workspace for drafting, analysis, and research</span>
            </div>
          </div>

          <div className="topbar-center">
            <span className="topbar-title">
              {activeConversation?.title ? activeConversation.title : "New thread"}
            </span>
          </div>

          <div className="topbar-right">
            <span className="topbar-pill topbar-pill-live">Render linked</span>
            <span className="topbar-pill">Mistral core</span>
          </div>
        </header>

        <ChatWindow
          key={activeId}
          conversation={activeConversation}
          onMessagesUpdate={updateMessages}
        />
      </main>
    </div>
  );
}

export default App;
