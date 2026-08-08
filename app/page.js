"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "The request failed.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (requestError) {
      setError(requestError.message ?? "Could not reach the API server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="chat-card">
        <header className="chat-header">
          <div className="logo">LC</div>
          <div>
            <h1>LangChain Agent</h1>
            <p><span className="status-dot" /> Ready to chat</p>
          </div>
        </header>

        <div className="messages" aria-live="polite">
          {messages.length === 0 && (
            <div className="empty-state">
              <span>✦</span>
              <h2>What can I help with?</h2>
              <p>Send a message to your Express + LangChain backend.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div className={`message-row ${message.role}`} key={index}>
              <div className="message-label">
                {message.role === "user" ? "You" : "Agent"}
              </div>
              <div className="bubble">{message.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="message-row assistant">
              <div className="message-label">Agent</div>
              <div className="bubble typing"><i /><i /><i /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="composer-wrap">
          {error && <p className="error">{error}</p>}
          <form className="composer" onSubmit={sendMessage}>
            <input
              aria-label="Message"
              autoComplete="off"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message your agent..."
              value={input}
            />
            <button disabled={!input.trim() || isLoading} type="submit" aria-label="Send message">
              ↑
            </button>
          </form>
          <p className="hint">Your message is sent to Express over REST.</p>
        </div>
      </section>
    </main>
  );
}
