"use client";

import { useEffect, useState } from "react";
import { getMessagesAPI, updateMessageStatusAPI } from "@/lib/api/contact";
import {
  Mail,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
  X,
  Reply,
  User,
  Calendar,
} from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "replied";
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessagesAPI();
      setMessages(data);
    } catch (error) {
      console.error("Error cargando mensajes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsReplied = async (id: string) => {
    try {
      await updateMessageStatusAPI(id, "replied");
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: "replied" } : msg))
      );
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg({ ...selectedMsg, status: "replied" });
      }
    } catch (error) {
      alert("Error al actualizar estado");
    }
  };

  const getMailtoLink = (msg: Message) => {
    const subject = `Re: ${msg.subject} - Soporte Fashion't Park`;
    const body = `Hola ${msg.name},\n\nHemos recibido tu consulta sobre "${msg.subject}".\n\n[ESCRIBE TU RESPUESTA AQUÍ]\n\nAtentamente,\nEl equipo de Fashion't Park`;
    return `mailto:${msg.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-950 min-h-screen text-slate-200 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Buzón de Mensajes
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Gestiona las consultas de los clientes
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="self-end sm:self-auto p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          title="Recargar"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay mensajes nuevos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Asunto</th>
                  <th className="p-4 font-medium hidden md:table-cell">
                    Mensaje
                  </th>
                  <th className="p-4 font-medium hidden lg:table-cell">
                    Fecha
                  </th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-4 whitespace-nowrap">
                      {msg.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Clock className="w-3 h-3" />{" "}
                          <span className="hidden sm:inline">Pendiente</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />{" "}
                          <span className="hidden sm:inline">Listo</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 max-w-[120px] sm:max-w-none truncate">
                      <div className="font-medium text-white truncate">
                        {msg.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {msg.email}
                      </div>
                    </td>

                    <td className="p-4 text-slate-300 font-medium truncate max-w-[100px] sm:max-w-[150px]">
                      {msg.subject}
                    </td>

                    <td className="p-4 max-w-xs hidden md:table-cell">
                      <p className="text-sm text-slate-400 truncate">
                        {msg.message}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap hidden lg:table-cell">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedMsg(msg)}
                          className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-sky-600 hover:text-white transition-all"
                          title="Ver Mensaje"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {msg.status === "pending" && (
                          <button
                            onClick={() => markAsReplied(msg.id)}
                            className="hidden sm:inline-flex items-center justify-center p-2 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-600/20"
                            title="Marcar como Respondido"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950 shrink-0">
              <div className="flex gap-4 overflow-hidden">
                <div className="bg-slate-800 p-3 rounded-full h-fit hidden sm:block">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {selectedMsg.subject}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1 truncate">
                      <span className="text-white font-medium">
                        {selectedMsg.name}
                      </span>
                      <span className="truncate">
                        &lt;{selectedMsg.email}&gt;
                      </span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedMsg.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-900">
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedMsg.message}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950 space-y-4 shrink-0 safe-area-bottom">
              {selectedMsg.status === "pending" ? (
                <div className="bg-sky-900/20 border border-sky-500/20 rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                  <div className="bg-sky-500/20 p-2 rounded-full shrink-0">
                    <Reply className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sky-400 font-medium text-sm">
                      Acción Requerida
                    </h4>
                    <p className="text-slate-400 text-xs truncate">
                      Responde al cliente usando tu correo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 sm:p-4 flex gap-3 sm:gap-4 items-center">
                  <div className="bg-emerald-500/20 p-2 rounded-full shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-emerald-400 font-medium text-sm">
                      Caso Resuelto
                    </h4>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <a
                  href={getMailtoLink(selectedMsg)}
                  className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium transition-colors w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  Responder por Correo
                </a>

                {selectedMsg.status === "pending" && (
                  <button
                    onClick={() => markAsReplied(selectedMsg.id)}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium transition-all w-full sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como Resuelto
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
