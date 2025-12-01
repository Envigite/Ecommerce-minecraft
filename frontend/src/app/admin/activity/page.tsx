"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { fetchAuditLogs, AuditLog } from "@/lib/api/audit";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminActivityPage() {
  const router = useRouter();
  const { user, hasHydrated } = useUserStore();
  const isAdmin = user?.role === "admin";

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAdmin) router.replace("/admin/dashboard");
  }, [hasHydrated, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const data = await fetchAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (!hasHydrated || !isAdmin) return null;
  if (loading)
    return (
      <p className="p-8 text-center text-slate-400">Cargando actividad...</p>
    );
  if (error) return <p className="p-8 text-center text-red-400">{error}</p>;

  const getActionStyle = (action: string) => {
    if (action.includes("DELETE"))
      return "bg-red-900/30 text-red-400 border-red-800";
    if (action.includes("CREATE"))
      return "bg-green-900/30 text-green-400 border-green-800";
    if (action.includes("UPDATE") || action.includes("ROLE"))
      return "bg-blue-900/30 text-blue-400 border-blue-800";
    return "bg-slate-700 text-slate-300 border-slate-600";
  };

  return (
    <section className="pb-10 min-h-screen">
      <div className="sticky z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-sm -mx-6 px-6 py-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Historial de Actividad
            </h1>
            <p className="text-sm text-slate-400">
              Auditoría de acciones administrativas
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">
              Últimos {logs.length} registros
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden bg-slate-800 rounded-lg shadow border border-slate-700">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium border-b border-slate-700">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Acción</th>
              <th className="px-6 py-3">Entidad</th>
              <th className="px-6 py-3">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-slate-700/50 transition group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                  {format(parseISO(log.created_at), "dd MMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </td>

                <td className="px-6 py-4 font-medium text-white">
                  {log.admin_name || "Desconocido"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getActionStyle(
                      log.action
                    )}`}
                  >
                    {log.action.replace("_", " ")}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-300">
                  <span className="capitalize">{log.entity}</span>
                  <span className="text-slate-500 text-xs ml-1">
                    #{log.entity_id}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {log.details ? (
                    <pre className="text-[10px] bg-slate-900/50 p-2 rounded border border-slate-700 text-slate-300 overflow-x-auto max-w-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getActionStyle(
                  log.action
                )}`}
              >
                {log.action}
              </span>
              <span className="text-xs text-slate-500">
                {format(parseISO(log.created_at), "dd MMM, HH:mm", {
                  locale: es,
                })}
              </span>
            </div>
            <p className="text-white font-medium text-sm">
              <span className="text-slate-400 font-normal">Por:</span>{" "}
              {log.admin_name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Afectó: {log.entity} #{log.entity_id}
            </p>
            {log.details && (
              <div className="mt-3 text-xs bg-slate-900/50 p-2 rounded border border-slate-700 font-mono text-slate-400 break-all">
                {JSON.stringify(log.details)}
              </div>
            )}
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-800 border-dashed">
          No hay actividad registrada aún.
        </div>
      )}
    </section>
  );
}
