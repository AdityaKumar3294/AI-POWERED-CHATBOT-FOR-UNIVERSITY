import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Send,
  GraduationCap,
  User,
  Bot,
  Trash2,
  RotateCcw,
} from "lucide-react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState("");

  const clearChat = () => {
    setMessages([]);
    setMessage("");
    setIsTyping(false);
    setLastFailedMessage("");
  };

  const handleSend = async (retryMessage = null) => {
    const currentMessage = retryMessage || message;

    if (!currentMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: "user",
    };

    // Only add a new user message if this is not a retry
    if (!retryMessage) {
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
    }

    setIsTyping(true);
    setLastFailedMessage("");

    try {
      const history = messages
      .filter((msg) => !msg.isError)
      .map((msg) => ({
        role:
          msg.sender === "user"
            ? "user"
            : "assistant",
        content: msg.text,
      }));

      const response = await axios.post(
        "http://localhost:5000/api/chat",
        {
          message: currentMessage,
          history,
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: "ai",
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

    } catch (error) {
      console.error("Chat Error:", error);

      setLastFailedMessage(currentMessage);

      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request.",
        sender: "ai",
        isError: true,
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);

    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">

        <div className="brand">

          <div className="logo">
            <GraduationCap size={25} />
          </div>

          <div>
            <h1>UniAssist AI</h1>
            <span>University Student Support</span>
          </div>

        </div>

        <div className="header-actions">

          {messages.length > 0 && (
            <button
              className="clear-chat-button"
              onClick={clearChat}
              disabled={isTyping}
              title="Clear conversation"
            >
              <Trash2 size={16} />
              <span>Clear Chat</span>
            </button>
          )}

          <div className="status">
            <span className="status-dot"></span>
            Online
          </div>

        </div>

      </header>


      {/* Chat Area */}
      <main className="chat-container">

        {messages.length === 0 ? (

          /* Welcome Screen */
          <div className="welcome">

            <div className="welcome-icon">
              <Bot size={40} />
            </div>

            <h2>Welcome to UniAssist AI 👋</h2>

            <p>
              Your AI-powered university student assistant.
              Ask questions about courses, exams, fees,
              departments, campus facilities and more.
            </p>


            {/* Suggestions */}
            <div className="suggestions">

              <button
                onClick={() =>
                  setMessage("Tell me about the courses offered at ABES.")
                }
              >
                📚 Courses
              </button>

              <button
                onClick={() =>
                  setMessage("Tell me about exams at ABES.")
                }
              >
                📝 Exams
              </button>

              <button
                onClick={() =>
                  setMessage("Tell me about university fees.")
                }
              >
                💰 Fees
              </button>

              <button
                onClick={() =>
                  setMessage("What facilities are available at ABES?")
                }
              >
                🏫 Campus
              </button>

            </div>

          </div>

        ) : (

          /* Messages */
          <div className="messages">

            {messages.map((msg) => (

              <div
                key={msg.id}
                className={`message-row ${msg.sender}`}
              >

                {/* Avatar */}
                <div className="avatar">

                  {msg.sender === "user" ? (
                    <User size={18} />
                  ) : (
                    <Bot size={18} />
                  )}

                </div>


                {/* Message */}
                <div className="message-bubble">

                  {msg.sender === "ai" ? (
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}

                  {msg.isError && lastFailedMessage && (
                    <button
                      className="retry-button"
                      onClick={() => handleSend(lastFailedMessage)}
                      disabled={isTyping}
                    >
                      <RotateCcw size={14} />
                      Retry
                    </button>
                  )}

                </div>

              </div>

            ))}


            {/* Typing Indicator */}
            {isTyping && (

              <div className="message-row ai">

                <div className="avatar">
                  <Bot size={18} />
                </div>

                <div className="typing-indicator">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            )}

          </div>

        )}

      </main>


      {/* Input Area */}
      <footer className="input-area">

        <div className="input-wrapper">

          <input
            type="text"
            placeholder={
              isTyping
                ? "UniAssist AI is typing..."
                : "Ask anything about your university..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />

          <button
            className="send-button"
            onClick={handleSend}
            disabled={isTyping || !message.trim()}
          >
            <Send size={20} />
          </button>

        </div>

        <p className="disclaimer">
          UniAssist AI can make mistakes. Verify important university
          information.
        </p>

      </footer>

    </div>
  );
}

export default App;