"use client";

import { useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@/hooks/useChat";

export default function ChatWidget() {
  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end font-sans">
      {/* Ventana del Chat */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Asistente Virtual</h3>
              <p className="text-xs text-slate-300">Minecraft Store Support</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-slate-700 p-2 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10 text-sm">
                <p>👋 ¡Hola! Soy tu asistente IA.</p>
                <p>Pregúntame sobre items o tus pedidos.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                  <div className="flex space-x-1 h-3 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Botón Flotante (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 cursor-pointer rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isOpen
            ? "bg-red-500 rotate-90 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
