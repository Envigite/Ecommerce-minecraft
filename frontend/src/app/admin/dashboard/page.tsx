"use client";

import { useEffect, useState, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";
import { fetchProducts } from "@/lib/api/products";
import { fetchUsers } from "@/lib/api/users";
import { formatCurrency } from "@/utils/formatCurrency";
import Image from "next/image";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { subDays, format, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from "@/constants/orders";
import { getOrderStatsAPI } from "@/lib/api/orders";

const COLORS = ["#0ea5e9", "#22c55e", "#eab308", "#ef4444", "#a855f7"];

export default function AdminDashboardPage() {
  const { user } = useUserStore();
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [orderStats, setOrderStats] = useState<any>({
    revenue: 0,
    ordersCount: 0,
    ordersByStatus: [],
    salesChart: [],
  });

  const chartDataSales = useMemo(() => {
    if (!orderStats.salesChart || orderStats.salesChart.length === 0) {
      return [{ date: "Hoy", sales: 0 }];
    }
    return orderStats.salesChart;
  }, [orderStats]);

  const statusData = useMemo(() => {
    if (!orderStats.ordersByStatus) return [];
    return orderStats.ordersByStatus.map((s: any) => ({
      name: ORDER_STATUS_LABELS[s.status as OrderStatus] || s.status,
      value: Number(s.count),
      rawStatus: s.status,
    }));
  }, [orderStats]);

  const [currentView, setCurrentView] = useState<"inventory" | "sales">(
    "inventory"
  );

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  const TABS = [
    { key: "7d", label: "7 Días" },
    { key: "30d", label: "30 Días" },
    { key: "90d", label: "3 Meses" },
    { key: "all", label: "Todo" },
  ] as const;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, usersData, statsData] = await Promise.all([
          fetchProducts(),
          isAdmin ? fetchUsers() : Promise.resolve([]),
          getOrderStatsAPI().catch(() => ({
            revenue: 0,
            ordersCount: 0,
            salesChart: [],
          })),
        ]);

        setProducts(productsData);
        setUsers(usersData);
        setOrderStats(statsData);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user, isAdmin]);

  const filterByDate = (data: any[]) => {
    if (timeRange === "all") return data;
    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const cutoffDate = subDays(now, daysMap[timeRange]);
    return data.filter((item) => {
      if (!item.created_at) return false;
      return isAfter(parseISO(item.created_at), cutoffDate);
    });
  };

  const chartData = useMemo(() => {
    const filteredProducts = filterByDate(products);
    const filteredUsers = filterByDate(users);
    const dataMap = new Map();

    [...filteredProducts, ...filteredUsers].forEach((item) => {
      if (!item.created_at) return;
      const dateKey = format(parseISO(item.created_at), "dd MMM", {
        locale: es,
      });
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { name: dateKey, productos: 0, usuarios: 0 });
      }
      const entry = dataMap.get(dateKey);
      if (item.price) entry.productos += 1;
      else entry.usuarios += 1;
    });

    if (dataMap.size < 2)
      return [
        { name: "Inicio", productos: 0, usuarios: 0 },
        { name: "Hoy", productos: products.length, usuarios: users.length },
      ];

    return Array.from(dataMap.values());
  }, [products, users, timeRange]);

  const categoryData = useMemo(() => {
    const catMap = new Map();
    products.forEach((p) => {
      const cats = p.category ? p.category.split(",") : ["Sin categoría"];
      cats.forEach((c: string) => {
        const key = c.trim();
        catMap.set(key, (catMap.get(key) || 0) + 1);
      });
    });
    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  const stats = {
    totalValue: products.reduce(
      (acc, p) => acc + Number(p.price) * (p.stock || 0),
      0
    ),
    lowStock: products.filter((p) => (p.stock || 0) < 10).length,
    newProducts: filterByDate(products).length,
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 animate-pulse">
        Cargando métricas...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
          <p className="text-slate-400 text-sm">
            {currentView === "inventory"
              ? "Gestión de Inventario y Stock"
              : "Reporte de Ventas y Finanzas"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-sm">
            <button
              onClick={() => setCurrentView("inventory")}
              className={`px-4 py-1.5 rounded-md transition font-medium cursor-pointer ${
                currentView === "inventory"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              Inventario
            </button>
            <button
              onClick={() => setCurrentView("sales")}
              className={`px-4 py-1.5 rounded-md transition font-medium cursor-pointer ${
                currentView === "sales"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              Ventas ($)
            </button>
          </div>

          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-sm">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeRange(tab.key)}
                className={`px-4 py-1.5 rounded-md transition font-medium cursor-pointer ${
                  timeRange === tab.key
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {currentView === "inventory" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Valor Inventario"
              value={formatCurrency(stats.totalValue)}
              trend="Activo Total"
              className="bg-emerald-900/20 border-emerald-900/50 text-emerald-100"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Productos Totales"
              value={products.length}
              trend={`+${stats.newProducts} en este periodo`}
              className="bg-sky-900/20 border-sky-900/50 text-sky-100"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Usuarios"
              value={isAdmin ? users.length : "---"}
              trend={isAdmin ? "Registrados" : "Acceso restringido"}
              className="bg-purple-900/20 border-purple-900/50 text-purple-100"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Stock Crítico"
              value={stats.lowStock}
              trend="Requieren atención"
              className={
                stats.lowStock > 0
                  ? "bg-red-900/20 border-red-900/50 text-red-100"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-6">
                Tendencia de Crecimiento
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorProd"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0ea5e9"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0ea5e9"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      {isAdmin && (
                        <linearGradient
                          id="colorUser"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a855f7"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a855f7"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      )}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="productos"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorProd)"
                      name="Productos Nuevos"
                    />
                    {isAdmin && (
                      <Area
                        type="monotone"
                        dataKey="usuarios"
                        stroke="#a855f7"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUser)"
                        name="Usuarios Nuevos"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">
                Distribución por Categoría
              </h3>
              <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      wrapperStyle={{ zIndex: 1000, outline: "none" }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">
                    {products.length}
                  </span>
                  <span className="text-xs text-slate-400">Total Items</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {categoryData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-slate-300 capitalize">
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-slate-400 font-medium">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-white">Actividad Reciente</h3>
                <Link
                  href="/admin/products"
                  className="text-xs text-sky-400 hover:underline"
                >
                  Ver todo
                </Link>
              </div>
              <div className="divide-y divide-slate-700">
                {products.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-lg">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            Sin img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Nuevo producto añadido
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {p.created_at
                        ? format(parseISO(p.created_at), "dd MMM", {
                            locale: es,
                          })
                        : "Hoy"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-white flex gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-red-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  Reposición Prioritaria
                </h3>
              </div>
              <div className="divide-y divide-slate-700">
                {products
                  .filter((p) => (p.stock || 0) < 10)
                  .slice(0, 5)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-red-900/30 text-red-400 flex items-center justify-center text-xs font-bold">
                          {p.stock}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Unidades restantes
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="px-3 py-1 text-xs border border-slate-600 rounded hover:bg-slate-700 text-slate-300"
                      >
                        Gestionar
                      </Link>
                    </div>
                  ))}
                {products.filter((p) => (p.stock || 0) < 10).length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Todo el inventario tiene buen stock.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {currentView === "sales" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Ingresos Totales"
              value={formatCurrency(orderStats.revenue)}
              trend="Dinero cobrado y confirmado"
              className="bg-emerald-900/20 border-emerald-900/50 text-emerald-100"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Órdenes Procesadas"
              value={orderStats.ordersCount}
              trend="Pagadas, Enviadas o Entregadas"
              className="bg-sky-900/20 border-sky-900/50 text-sky-100"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Ticket Promedio"
              value={
                orderStats.ordersCount > 0
                  ? formatCurrency(orderStats.revenue / orderStats.ordersCount)
                  : formatCurrency(0)
              }
              trend="Gasto promedio por cliente"
              className="bg-purple-900/20 border-purple-900/50 text-purple-100"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-6">
                Flujo de Ventas (Últimos 7 días)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataSales}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        color: "#fff",
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Ventas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">
                Estado de Órdenes
              </h3>
              <div className="flex-1 min-h-[250px] relative">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#e2e8f0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Sin órdenes registradas
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">
                    {orderStats.ordersCount}
                  </span>
                  <span className="text-xs text-slate-400">Total</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((entry: any, index: number) => {
                  const badgeStyle =
                    ORDER_STATUS_COLORS[entry.rawStatus as OrderStatus] ||
                    "bg-slate-700 text-slate-300";
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeStyle}`}
                        >
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        {entry.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatsCard({ title, value, trend, icon, className }: any) {
  return (
    <div
      className={`p-6 rounded-xl border shadow-sm transition-colors ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">
            {title}
          </p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white/10 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <p className="text-xs opacity-70 font-medium">{trend}</p>
    </div>
  );
}
