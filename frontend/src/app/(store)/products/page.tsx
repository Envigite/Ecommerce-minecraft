"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/formatCurrency";
import { useCartStore } from "@/store/useCartStore";
import { CATEGORY_HIERARCHY } from "@/utils/categories";
import { useStickyOffsets } from "@/hooks/useStickyOffsets";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { headerHeight, subHeaderHeight } = useStickyOffsets();

  const search = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category");
  const groupParam = searchParams.get("group");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { addItem, items: cartItems } = useCartStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = products.filter((p) => {
      const pName = p.name.toLowerCase();
      const pCats = Array.isArray(p.category)
        ? p.category.join(" ").toLowerCase()
        : (p.category ?? "").toLowerCase();

      if (term) {
        const matchesName = pName.includes(term);
        const matchesCategory = pCats.includes(term);
        if (!matchesName && !matchesCategory) return false;
      }

      if (categoryParam && !pCats.includes(categoryParam.toLowerCase()))
        return false;

      if (groupParam) {
        const group = CATEGORY_HIERARCHY.find((g) => g.slug === groupParam);
        if (group) {
          const hasSubcat = group.subcategories.some((sub) =>
            pCats.includes(sub.toLowerCase())
          );
          if (!hasSubcat) return false;
        }
      }

      const price = Number(p.price);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      if (hideOutOfStock && (p.stock || 0) <= 0) return false;

      return true;
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [
    products,
    search,
    categoryParam,
    groupParam,
    minPrice,
    maxPrice,
    hideOutOfStock,
    sortBy,
  ]);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setHideOutOfStock(false);
    setSortBy("newest");
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();

    const stockDisponible = product.stock || 0;

    if (stockDisponible <= 0) return;

    const itemInCart = cartItems.find((i) => i.id === product.id);
    const currentQty = itemInCart ? itemInCart.quantity : 0;

    if (currentQty + 1 > stockDisponible) {
      alert(`¡No puedes agregar más! Solo quedan ${stockDisponible} unidades.`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    });
  };

  const currentTitle = groupParam
    ? CATEGORY_HIERARCHY.find((g) => g.slug === groupParam)?.name
    : categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
    : "Todos los Productos";

  const hasNavFilters = !!(groupParam || categoryParam || search);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      <div
        id="products-subheader"
        className="sticky z-30 bg-white/95 backdrop-blur-md py-6 mb-2 border-b border-slate-100 transition-all"
        style={{ top: headerHeight }}
      >
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2 md:px-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize leading-tight">
              {currentTitle}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {loading
                ? "Cargando catálogo..."
                : `Mostrando ${filteredProducts.length} productos`}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-slate-500 hidden sm:inline">
              Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 md:flex-none border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer hover:border-slate-400 transition"
            >
              <option value="newest">Más Relevantes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="name_asc">Nombre: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        <aside
          className="hidden lg:block w-64 shrink-0 space-y-8 h-fit sticky overflow-y-auto pr-2 custom-scrollbar"
          style={{
            top: headerHeight + subHeaderHeight + 20,
            maxHeight: `calc(100vh - ${headerHeight + subHeaderHeight + 40}px)`,
          }}
        >
          <div>
            <Link
              href="/products"
              className={`flex items-center justify-center font-medium text-sm px-4 py-3 rounded-xl border transition-all group ${
                hasNavFilters
                  ? "bg-white border-slate-300 hover:border-sky-500 hover:text-sky-600 shadow-sm"
                  : "bg-slate-100 border-transparent text-slate-400 cursor-default"
              }`}
            >
              Ver todo el catálogo
            </Link>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              Precio
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                  $
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-6 pr-2 py-2 text-sm focus:border-sky-500 focus:ring-1 outline-none transition"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                  $
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-6 pr-2 py-2 text-sm focus:border-sky-500 focus:ring-1 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              Disponibilidad
            </h3>
            <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition select-none">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={hideOutOfStock}
                  onChange={(e) => setHideOutOfStock(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-sky-500 checked:bg-sky-500 hover:border-sky-400"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                Ocultar Agotados
              </span>
            </label>
          </div>

          {(minPrice || maxPrice || hideOutOfStock || sortBy !== "newest") && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg w-full text-center transition"
            >
              Limpiar filtros
            </button>
          )}
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const stock = p.stock || 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock < 5;

                return (
                  <Link
                    href={`/products/${p.id}`}
                    key={p.id}
                    className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col relative
                      ${
                        isOutOfStock
                          ? "border-slate-100 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 cursor-not-allowed md:cursor-pointer" // En móvil a veces es mejor dejar clickear
                          : "border-slate-100 hover:border-sky-200 hover:shadow-xl hover:-translate-y-1"
                      }
                    `}
                  >
                    {isOutOfStock && (
                      <div className="absolute top-3 left-3 z-20 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">
                        Agotado
                      </div>
                    )}
                    {!isOutOfStock && isLowStock && (
                      <div className="absolute top-3 left-3 z-20 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md animate-pulse">
                        Últimas Unidades
                      </div>
                    )}

                    <div className="relative aspect-4/3 bg-white p-6 flex items-center justify-center border-b border-slate-50">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <span className="text-slate-300 text-xs">
                          Sin imagen
                        </span>
                      )}

                      {!isOutOfStock && (
                        <button
                          onClick={(e) => handleQuickAdd(e, p)}
                          className="hidden lg:flex absolute bottom-3 right-3 bg-sky-600 text-white p-2.5 rounded-full shadow-lg hover:bg-sky-500 hover:scale-110 transition-all opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 z-10 cursor-pointer"
                          title="Añadir al carrito"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h2 className="text-slate-700 font-medium line-clamp-2 text-sm sm:text-base flex-1 group-hover:text-sky-600 transition-colors">
                        {p.name}
                      </h2>

                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p
                            className={`font-bold text-lg leading-none ${
                              isOutOfStock
                                ? "text-slate-400 line-through decoration-2"
                                : "text-slate-900"
                            }`}
                          >
                            {formatCurrency(Number(p.price))}
                          </p>

                          {isOutOfStock ? (
                            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                              No disponible
                            </p>
                          ) : isLowStock ? (
                            <p className="text-[10px] text-orange-500 font-medium mt-1">
                              ¡Solo quedan {stock}!
                            </p>
                          ) : null}
                        </div>

                        {!isOutOfStock && (
                          <button
                            onClick={(e) => handleQuickAdd(e, p)}
                            className="lg:hidden text-sky-600 bg-sky-50 p-2 rounded-lg active:scale-95 transition"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">
                📦
              </div>
              <p className="text-slate-900 font-medium text-lg">
                No encontramos productos
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Intenta ajustar los filtros
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 text-sky-600 hover:text-sky-700 font-bold hover:underline transition cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
