"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import LayoutWrapper from "@/components/LayoutWrapper";
import { sendContactMessageAPI } from "@/lib/api/contact";
import {
  MapPin,
  Mail,
  MessageSquare,
  Send,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar el error de este campo cuando el usuario escribe
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      await sendContactMessageAPI({
        ...formData,
        userId: user?.id || null,
      });

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error(error);

      if (error.details && Array.isArray(error.details)) {
        const newFieldErrors: Record<string, string> = {};

        error.details.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            newFieldErrors[issue.path[0]] = issue.message;
          }
        });
        setFieldErrors(newFieldErrors);
      } else {
        setGeneralError(error.message || "Hubo un error al enviar el mensaje.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 -mt-4 -mb-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Centro de Soporte{" "}
              <span className="text-sky-500">Fashion&apos;t Park</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Escríbenos y nuestro equipo de golems te responderá.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  Oficina Central
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Av. Siempre Viva 742
                  <br />
                  Minecraft Server
                </p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-500" />
                  Contacto Directo
                </h3>
                <p className="text-sm text-slate-400">
                  fashiontpark.official@gmail.com
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-sky-500 via-emerald-500 to-sky-500" />

                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-emerald-500/10 p-4 rounded-full mb-4">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      ¡Mensaje Enviado!
                    </h3>
                    <p className="text-slate-400 max-w-md">
                      Un administrador revisará tu consulta pronto.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="cursor-pointer mt-8 text-sky-400 hover:text-sky-300 font-medium underline underline-offset-4"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {generalError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {generalError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium text-slate-300 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          Tu Nombre
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full bg-slate-950 border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                            fieldErrors.name
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-700 focus:ring-sky-500"
                          }`}
                          placeholder="Steve"
                        />
                        {fieldErrors.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-slate-300 flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4 text-slate-500" />
                          Correo
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full bg-slate-950 border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                            fieldErrors.email
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-700 focus:ring-sky-500"
                          }`}
                          placeholder="steve@minecraft.com"
                        />
                        {fieldErrors.email && (
                          <p className="text-xs text-red-500 mt-1">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-sm font-medium text-slate-300 flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        Asunto
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full bg-slate-950 border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                          fieldErrors.subject
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-700 focus:ring-sky-500"
                        }`}
                      />
                      {fieldErrors.subject && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.subject}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-sm font-medium text-slate-300"
                      >
                        Mensaje
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full bg-slate-950 border rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 resize-none transition-all ${
                          fieldErrors.message
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-700 focus:ring-sky-500"
                        }`}
                      />
                      {fieldErrors.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="cursor-pointer w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Enviar Mensaje
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
