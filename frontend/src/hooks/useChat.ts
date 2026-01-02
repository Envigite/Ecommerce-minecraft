import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chat_session_id") || uuidv4();
    }
    return "";
  });

  useEffect(() => {
    localStorage.setItem("chat_session_id", sessionId);
  }, [sessionId]);

  const getToken = () => null;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const authToken = getToken();
      
      const payload = {
        message: userMsg,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        sessionId: sessionId,
        authToken: authToken,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error en la respuesta");

      const data = await res.json();
      const botResponse =
        data.response || data.answer || data.message || "No pude entender eso.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botResponse },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, mis servidores de IA están durmiendo ahora mismo. 😴",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
  };
};