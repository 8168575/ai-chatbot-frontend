import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../services/chatApi.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { speakText } from "../hooks/useSpeechSynthesis.js";

const STARTER_PROMPTS = [
  {
    icon: "01",
    title: "Executive brief",
    sub: "Turn a long topic into a clear, concise summary",
    prompt: "Summarize the latest trends in machine learning in a concise executive brief.",
  },
  {
    icon: "02",
    title: "Structured draft",
    sub: "Generate a polished outline or first draft fast",
    prompt: "Create a structured draft on the importance of renewable energy.",
  },
  {
    icon: "03",
    title: "Research scan",
    sub: "Map a topic, assumptions, and next questions",
    prompt: "Give me a research scan on the latest developments in quantum computing.",
  },
  {
    icon: "04",
    title: "Idea workshop",
    sub: "Brainstorm practical directions with tradeoffs",
    prompt: "Give me 5 innovative project ideas related to AI in education.",
  },
];

const WORKSPACE_NOTES = [
  "Reply audio available",
  "Voice input ready",
  "Threads saved locally",
];

const buildHistory = (messages) => {
  const firstUserIndex = messages.findIndex((message) => message.role === "user");
  if (firstUserIndex === -1) return [];

  return messages.slice(firstUserIndex).map((message) => ({
    role: message.role === "model" ? "assistant" : message.role,
    content: message.text,
  }));
};

function ChatWindow({ conversation, onMessagesUpdate }) {
  const [messages, setMessages] = useState(conversation?.messages ?? []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessages(conversation?.messages ?? []);
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  const handleSend = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    const historyBeforeThis = buildHistory(messages);
    const userMessage = { role: "user", text, timestamp: Date.now() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    onMessagesUpdate?.(nextMessages);

    try {
      const reply = await sendMessage(text, historyBeforeThis);
      const modelMessage = { role: "model", text: reply, timestamp: Date.now() };
      const finalMessages = [...nextMessages, modelMessage];
      setMessages(finalMessages);
      onMessagesUpdate?.(finalMessages);

      if (voiceReplyEnabled) {
        speakText(reply);
      }
    } catch (error) {
      const errorMessage = {
        role: "model",
        text: `Warning: ${error.message || "Something went wrong."}`,
        timestamp: Date.now(),
      };
      const finalMessages = [...nextMessages, errorMessage];
      setMessages(finalMessages);
      onMessagesUpdate?.(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const { startListening, isListening, isSupported } = useSpeechRecognition((transcript) => {
    setInput(transcript);
    handleSend(transcript);
  });

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {isEmpty ? (
        <div className="welcome-screen">
          <section className="welcome-hero">
            <div className="welcome-copy">
              <span className="welcome-eyebrow">HFM workspace</span>
              <h1 className="welcome-title">Professional chat for focused work.</h1>
              <p className="welcome-subtitle">
                HFM Campus AI is tuned for research, drafting, and analysis with a cleaner workflow, production-grade dark UI, and direct access to your Render backend.
              </p>

              <div className="welcome-meta-row">
                <span className="welcome-meta-card">Dark command surface</span>
                <span className="welcome-meta-card">Persistent threads</span>
                <span className="welcome-meta-card">Voice enabled</span>
              </div>
            </div>

            <aside className="welcome-aside">
              <div className="welcome-aside-panel">
                <span className="welcome-aside-label">Workspace status</span>
                <div className="welcome-aside-main">
                  <span className="welcome-aside-name">HFM Campus AI</span>
                  <span className="welcome-aside-state">Render backend connected</span>
                </div>
                <div className="welcome-aside-list">
                  {WORKSPACE_NOTES.map((item) => (
                    <div key={item} className="welcome-aside-item">
                      <span className="welcome-aside-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <div className="welcome-prompt-header">
            <div>
              <span className="welcome-section-kicker">Start with a strong prompt</span>
              <h2 className="welcome-section-title">Choose a workflow</h2>
            </div>
            <p className="welcome-section-copy">
              Each card launches a different work mode and gives HFM Campus AI enough context to produce a better first reply.
            </p>
          </div>

          <div className="welcome-prompts">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.title}
                className="welcome-prompt-card"
                onClick={() => handleSend(prompt.prompt)}
              >
                <span className="welcome-prompt-icon">{prompt.icon}</span>
                <div className="welcome-prompt-copy">
                  <div className="welcome-prompt-title">{prompt.title}</div>
                  <div className="welcome-prompt-sub">{prompt.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="messages-area">
          <div className="thread-shell">
            <div className="thread-header">
              <span className="thread-header-kicker">Active conversation</span>
              <h2 className="thread-header-title">{conversation?.title || "Untitled thread"}</h2>
            </div>

            {messages.map((message, index) => (
              <div key={index} className={`message-row ${message.role}`}>
                <div className="message-inner">
                  {message.role === "model" ? (
                    <div className="message-avatar-row">
                      <div className="message-avatar">H</div>
                      <span className="message-sender-label">HFM Campus AI</span>
                    </div>
                  ) : (
                    <div className="message-avatar-row user-meta">
                      <span className="message-sender-label">You</span>
                    </div>
                  )}
                  <div className="message-bubble">{message.text}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="typing-row">
                <div className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="input-area">
        <div className="input-shell">
          <div className="composer-toolbar">
            <span className="composer-status">HFM Campus AI ready</span>
            <span className="composer-separator" aria-hidden="true" />
            <span className="composer-status muted">Powered by Mistral</span>
          </div>

          <div className="input-box">
            <div className="input-box-inner">
              <textarea
                ref={textareaRef}
                className="input-textarea"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Message HFM Campus AI..."}
                disabled={isLoading}
                aria-label="Message input"
              />
              <div className="input-actions">
                {isSupported && (
                  <button
                    className={`mic-btn${isListening ? " listening" : ""}`}
                    onClick={startListening}
                    title={isListening ? "Listening..." : "Click to speak"}
                    disabled={isLoading}
                    aria-label="Voice input"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  </button>
                )}
                <button
                  className="send-btn"
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="composer-footer">
            <label className="voice-toggle" title="Toggle text-to-speech replies">
              <input
                type="checkbox"
                checked={voiceReplyEnabled}
                onChange={(event) => setVoiceReplyEnabled(event.target.checked)}
              />
              <span className="voice-toggle-switch" />
              <span className="voice-toggle-label">Read replies aloud</span>
            </label>

            <p className="input-hint">HFM Campus AI can still make mistakes. Verify important details.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatWindow;
