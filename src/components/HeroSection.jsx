function HeroSection({ onOpenChat }) {
  return (
    <section className="hero">
      <span className="hero-badge">Powered by Mistral</span>
      <h1>Welcome to HFM Campus AI</h1>
      <p className="hero-subtitle">
        A focused AI workspace for drafting, analysis, and fast collaboration.
      </p>

      <div className="hero-chat-box" onClick={onOpenChat}>
        <span className="hero-chat-icon">✦</span>
        <h2>Open HFM Campus AI</h2>
        <p>Click to start a conversation</p>
      </div>
    </section>
  );
}

export default HeroSection;
