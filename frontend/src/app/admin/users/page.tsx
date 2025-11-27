"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { fetchUsers, updateUserRole, deleteUser } from "@/lib/api/users";
import type { User } from "@/types/user";
import ProductSearchBar from "@/components/ProductSearchBar";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, hasHydrated } = useUserStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "manager" | "user">(
    "all"
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (currentUser?.role !== "admin") {
      router.replace("/admin/dashboard");
    }
  }, [hasHydrated, currentUser, router]);

  if (!hasHydrated || currentUser?.role !== "admin") {
    return null;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRoleChange = async (
    id: string,
    newRole: "admin" | "manager" | "user"
  ) => {
    setActionLoading(id);
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar usuario? Esta acción es irreversible.")) return;
    setActionLoading(id);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filter === "all" || u.role === filter;
    const term = search.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);

    return matchesRole && matchesSearch;
  });

  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-900/30 text-purple-300 border-purple-800",
      manager: "bg-blue-900/30 text-blue-300 border-blue-800",
      user: "bg-green-900/30 text-green-300 border-green-800",
    };
    const currentStyle = styles[role] || styles.user;
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}
      >
        {role.toUpperCase()}
      </span>
    );
  };

  const ActionButtons = ({ u }: { u: User }) => (
    <div className="flex gap-2 justify-end">
      {u.role === "user" && (
        <>
          <button
            onClick={() => handleRoleChange(u.id, "manager")}
            disabled={!!actionLoading}
            className="px-3 py-1 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 rounded border border-blue-800 text-xs font-medium transition cursor-pointer"
          >
            Manager
          </button>
          <button
            onClick={() => handleRoleChange(u.id, "admin")}
            disabled={!!actionLoading}
            className="px-3 py-1 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 rounded border border-purple-800 text-xs font-medium transition cursor-pointer"
          >
            Admin
          </button>
        </>
      )}

      {u.role === "manager" && (
        <>
          <button
            onClick={() => handleRoleChange(u.id, "user")}
            disabled={!!actionLoading}
            className="px-3 py-1 bg-green-900/20 text-green-400 hover:bg-green-900/40 rounded border border-green-800 text-xs font-medium transition cursor-pointer"
          >
            User
          </button>
          <button
            onClick={() => handleRoleChange(u.id, "admin")}
            disabled={!!actionLoading}
            className="px-3 py-1 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 rounded border border-purple-800 text-xs font-medium transition cursor-pointer"
          >
            Admin
          </button>
        </>
      )}

      {u.role === "admin" && (
        <>
          <button
            onClick={() => handleRoleChange(u.id, "manager")}
            disabled={!!actionLoading || currentUser?.id === u.id}
            className="px-3 py-1 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 rounded border border-blue-800 text-xs font-medium transition disabled:opacity-50 cursor-pointer"
          >
            Manager
          </button>
          <button
            onClick={() => handleRoleChange(u.id, "user")}
            disabled={!!actionLoading || currentUser?.id === u.id}
            className="px-3 py-1 bg-green-900/20 text-green-400 hover:bg-green-900/40 rounded border border-green-800 text-xs font-medium transition disabled:opacity-50 cursor-pointer"
          >
            User
          </button>
        </>
      )}

      <button
        onClick={() => handleDelete(u.id)}
        disabled={!!actionLoading || currentUser?.id === u.id}
        className="px-3 py-1 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded border border-red-800 text-xs font-medium transition disabled:opacity-50 cursor-pointer"
      >
        Eliminar
      </button>
    </div>
  );

  if (loading)
    return (
      <p className="p-8 text-center text-slate-400">Cargando usuarios...</p>
    );
  if (error) return <p className="p-8 text-center text-red-400">{error}</p>;

  return (
    <section className="pb-10 min-h-screen">
      <div className="sticky top-14 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-sm -mx-6 px-6 py-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Administrar Usuarios
              </h1>
              <p className="text-sm text-slate-400">
                Mostrando {filteredUsers.length} de {users.length}
              </p>
            </div>
            <div className="w-full md:w-auto">
              <ProductSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Buscar usuario..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "admin", "manager", "user"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition border ${
                  filter === f
                    ? "bg-sky-600 text-white border-sky-500 shadow"
                    : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
                }`}
              >
                {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className="bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-white flex items-center gap-2">
                  {u.username}
                  {currentUser?.id === u.id && (
                    <span className="text-[10px] bg-sky-900 text-sky-300 px-1.5 rounded border border-sky-700">
                      Tú
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <ActionButtons u={u} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-hidden bg-slate-800 rounded-lg shadow border border-slate-700">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium border-b border-slate-700">
            <tr>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-700/50 transition">
                <td className="px-6 py-4 font-medium text-white">
                  {u.username}
                  {currentUser?.id === u.id && (
                    <span className="ml-2 text-xs bg-sky-900 text-sky-300 px-2 py-0.5 rounded-full border border-sky-700">
                      Tú
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-6 py-4 text-right">
                  <ActionButtons u={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p className="text-center text-slate-500 py-12 border border-dashed border-slate-800 rounded-lg mt-4">
          No se encontraron resultados.
        </p>
      )}
    </section>
  );
}
