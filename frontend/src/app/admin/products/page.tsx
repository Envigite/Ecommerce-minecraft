"use client";

import { useEffect, useState, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";
import type { Product } from "@/types/product";
import { fetchProducts, deleteProduct } from "@/lib/api/products";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import ProductSearchBar from "@/components/ProductSearchBar";
import Link from "next/link";

export default function AdminProductsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el producto");
    }
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const catString = Array.isArray(p.category)
        ? p.category.join(" ").toLowerCase()
        : (p.category ?? "").toLowerCase();

      return name.includes(term) || catString.includes(term);
    });
  }, [products, search]);

  const renderCategories = (cat: string | string[] | null | undefined) => {
    if (!cat) return <span className="text-slate-500">-</span>;

    const categories = Array.isArray(cat)
      ? cat
      : cat.includes(",")
      ? cat.split(",")
      : [cat];

    return (
      <div className="flex flex-wrap gap-1">
        {categories.map((c, i) => (
          <span
            key={i}
            className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize border border-slate-600"
          >
            {c.trim()}
          </span>
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <p className="p-8 text-center text-slate-400">Cargando productos...</p>
    );

  return (
    <section className="pb-10 min-h-screen">
      <div className="stickyz-20 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-sm -mx-6 px-6 py-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Administrar Productos
              </h1>
              <p className="text-sm text-slate-400">
                Mostrando {filteredProducts.length} de {products.length}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="w-full sm:w-64">
                <ProductSearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar producto..."
                />
              </div>

              {(isAdmin || isManager) && (
                <Link
                  href={"/admin/products/create"}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition flex items-center justify-center whitespace-nowrap shadow-sm"
                >
                  + Crear producto
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-sm"
          >
            <div className="flex gap-4">
              <div className="relative w-20 h-20 bg-slate-700 rounded-lg overflow-hidden shrink-0 border border-slate-600">
                {p.image_url ? (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                    Sin img
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white truncate">
                  {p.name}
                </h3>
                <p className="text-green-400 font-semibold">
                  {formatCurrency(Number(p.price))}
                </p>
                <p className="text-sm text-slate-400 mt-1">Stock: {p.stock}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700">
              <div className="mb-3">{renderCategories(p.category)}</div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => router.push(`/admin/products/${p.id}`)}
                  className="px-4 py-1.5 bg-blue-900/20 text-blue-400 border border-blue-800 rounded text-sm font-medium hover:bg-blue-900/40 cursor-pointer"
                >
                  Editar
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-4 py-1.5 bg-red-900/20 text-red-400 border border-red-800 rounded text-sm font-medium hover:bg-red-900/40 cursor-pointer"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-hidden bg-slate-800 rounded-lg shadow border border-slate-700">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium border-b border-slate-700">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Precio</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4">Categorías</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-700">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-700/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-slate-700 rounded overflow-hidden shrink-0 border border-slate-600">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          width={300}
                          height={200}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                          Sin img
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-slate-100">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 font-medium text-green-400">
                  {formatCurrency(Number(p.price))}
                </td>
                <td className="p-4 text-center">{p.stock}</td>
                <td className="p-4 max-w-xs">{renderCategories(p.category)}</td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => router.push(`/admin/products/${p.id}`)}
                      className="text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
                    >
                      Editar
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-slate-500 py-12 border border-dashed border-slate-800 rounded-lg mt-4">
          No se encontraron productos.
        </p>
      )}
    </section>
  );
}
