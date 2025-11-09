import { useState, useEffect, useRef } from "react";
import api from "../api/client";

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  sources: Array<{
    text: string;
    page?: number;
    clauseType?: string;
    relevanceScore?: number;
  }>;
  createdAt: string;
  processingTime?: number;
}

interface ChatInterfaceProps {
  contractId: string;
  onClose?: () => void;
}

const ChatInterface = ({ contractId, onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, [contractId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get(`/chat/contracts/${contractId}/history`);
      const fetchedMessages = response.data.data.messages || [];
      
      // Filter out any invalid messages
      const validMessages = fetchedMessages.filter(
        (msg: any) => msg && msg.question && msg.answer && msg.id
      );
      
      setMessages(validMessages);
      console.log("Fetched chat messages:", validMessages.length);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setMessages([]); // Set to empty array on error
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await api.post(`/chat/contracts/${contractId}/ask`, {
        question,
      });

      console.log("Chat response:", response.data);
      const newMessage = response.data.data.chatMessage;
      
      // Ensure the message has all required fields
      if (newMessage && newMessage.question && newMessage.answer) {
        console.log("Adding new message:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        console.error("Invalid message format received:", response.data);
        alert("Received invalid response format from server. Check console for details.");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      alert(error.response?.data?.message || "Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear the chat history?")) {
      return;
    }

    try {
      await api.delete(`/chat/contracts/${contractId}/clear`);
      setMessages([]);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to clear history");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border-4 border-black shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b-4 border-black flex items-center justify-between bg-yellow-400 rounded-t-lg">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 mr-2 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-lg font-black text-black">ASK AI ABOUT CONTRACT</h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-black hover:text-red-600 p-2 rounded-lg hover:bg-red-100 transition"
              title="Clear chat history"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-black hover:text-red-600 p-2 rounded-lg hover:bg-red-100 transition"
              title="Close chat"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loadingHistory ? (
          <div className="text-center py-8">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-yellow-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-sm text-gray-700 font-bold">LOADING CHAT HISTORY...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="mt-4 text-black font-bold">
              NO MESSAGES YET
            </p>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Ask a question about this contract!
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Examples: "What is the termination notice period?" or "Who are the
              parties?"
            </p>
          </div>
        ) : (
          messages.filter(m => m && m.question && m.answer).map((message) => (
            <div key={message.id} className="space-y-3">
              {/* Question */}
              <div className="flex justify-end">
                <div className="max-w-3xl bg-black text-yellow-400 rounded-lg px-4 py-3 border-2 border-black shadow-lg">
                  <p className="text-sm font-medium">{message.question}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>

              {/* Answer */}
              <div className="flex justify-start">
                <div className="max-w-3xl bg-yellow-50 rounded-lg px-4 py-3 shadow-md border-2 border-black">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-black flex items-center justify-center text-yellow-400 font-black mr-3">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-black whitespace-pre-wrap font-medium">
                        {message.answer}
                      </p>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t-2 border-black">
                          <p className="text-xs font-black text-black mb-2">
                            SOURCES:
                          </p>
                          <div className="space-y-2">
                            {message.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-white p-3 rounded-lg border-2 border-black"
                              >
                                {source.clauseType && (
                                  <span className="inline-block px-2 py-1 bg-black text-yellow-400 rounded text-xs font-bold mb-1">
                                    {source.clauseType.toUpperCase()}
                                  </span>
                                )}
                                {source.page && (
                                  <span className="text-gray-700 ml-2 font-bold">
                                    (PAGE {source.page})
                                  </span>
                                )}
                                <p className="text-gray-700 mt-1 font-medium">
                                  "{source.text.substring(0, 200)}
                                  {source.text.length > 200 ? "..." : ""}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        {formatTime(message.createdAt)}
                        {message.processingTime && (
                          <span className="ml-2">
                            ({(message.processingTime / 1000).toFixed(1)}s)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-3xl bg-yellow-50 rounded-lg px-4 py-3 shadow-md border-2 border-black">
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-yellow-600 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm text-black font-bold">THINKING...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t-4 border-black bg-yellow-400 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this contract..."
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-200 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed font-black transition transform hover:scale-105 disabled:transform-none border-2 border-black"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-black font-medium mt-2">
          Ask questions like: "What's the termination notice period?" or "What are
          the payment terms?"
        </p>
      </form>
    </div>
  );
};

export default ChatInterface;

