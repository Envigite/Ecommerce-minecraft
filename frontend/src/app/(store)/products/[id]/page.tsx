"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchProductById, fetchProducts } from "@/lib/api/products";
import InfiniteCarousel from "@/components/ui/InfiniteCarousel";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);

        const allProducts = await fetchProducts();

        const currentCats = data.category
          ? data.category.split(",").map((c: string) => c.trim().toLowerCase())
          : [];

        const related = allProducts
          .filter((p: Product) => {
            if (String(p.id) === String(data.id)) return false;
            if (currentCats.length === 0) return false;

            const otherCats = p.category
              ? p.category.split(",").map((c: string) => c.trim().toLowerCase())
              : [];

            return currentCats.some((cat: string) => otherCats.includes(cat));
          })
          .slice(0, 12);

        setRelatedProducts(related);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 animate-pulse">
        Cargando detalle del producto...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">📦</div>
        <h2 className="text-2xl font-bold text-slate-700">
          Producto no encontrado
        </h2>
        <p className="text-slate-500">Parece que este bloque ya fue minado.</p>
        <button
          onClick={() => router.push("/products")}
          className="text-sky-600 hover:text-sky-700 font-medium hover:underline flex items-center gap-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Volver a la tienda
        </button>
      </div>
    );

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
    });

    if (isAuthenticated) {
      router.push("/cart");
    } else {
      router.push("/login?redirect=/cart");
    }
  };

  const maxStock = product.stock ?? 0;
  const isOutOfStock = maxStock <= 0;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <nav className="flex text-sm text-slate-500 mb-8 overflow-hidden whitespace-nowrap text-ellipsis">
        <Link href="/" className="hover:text-sky-600 transition">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-sky-600 transition">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 font-medium truncate">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 flex items-center justify-center shadow-sm relative overflow-hidden group">
            <div className="relative w-full aspect-square max-w-[600px]">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform p-8 duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl text-slate-400 gap-2">
                  <span className="text-4xl">📷</span>
                  <span className="text-sm font-medium">Sin Imagen</span>
                </div>
              )}
            </div>

            {isOutOfStock && (
              <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-red-200">
                Agotado
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="lg:sticky lg:top-24">
            <p className="text-sky-600 font-medium text-sm mb-2 uppercase tracking-wider">
              {product.category ? product.category.split(",")[0] : "General"}
            </p>
            <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-end gap-4 mb-6 border-b border-slate-100 pb-6">
              <span className="text-4xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(Number(product.price))}
              </span>

              {!isOutOfStock ? (
                <div className="flex flex-col mb-1">
                  <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                    En Stock
                  </span>
                  {maxStock < 10 && (
                    <span className="text-xs text-orange-500 font-medium">
                      ¡Solo quedan {maxStock} unidades!
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-red-500 text-sm font-bold flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Sin
                  Stock
                </span>
              )}
            </div>

            <div className="prose prose-slate text-slate-600 mb-8">
              <p className="leading-relaxed">
                {product.description ||
                  "Este producto no tiene descripción detallada, pero seguro es genial para tu inventario."}
              </p>
            </div>

            <div className="space-y-4">
              {!isOutOfStock ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium text-slate-700">
                      Cantidad:
                    </span>
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm w-max">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 cursor-pointer text-slate-500 hover:text-sky-600 hover:bg-slate-50 transition border-r border-slate-100 rounded-l-xl disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-semibold text-slate-900 w-12 text-center select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(maxStock, quantity + 1))
                        }
                        className="px-4 py-2 cursor-pointer text-slate-500 hover:text-sky-600 hover:bg-slate-50 transition border-l border-slate-100 rounded-r-xl disabled:opacity-50"
                        disabled={quantity >= maxStock}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      {maxStock} disponibles
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 cursor-pointer bg-white border-2 border-slate-200 hover:text-gray-700 hover:bg-green-400 hover:border-green-600 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2"
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
                          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                        />
                      </svg>
                      Añadir al Carrito
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-sky-600 cursor-pointer hover:bg-sky-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      Comprar Ahora
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-slate-500 font-medium">
                    Este producto no está disponible por el momento.
                  </p>
                  <button className="mt-2 cursor-pointer text-sky-600 text-sm hover:underline font-semibold">
                    Avísame cuando haya stock
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Entrega inmediata</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>Pago seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 4 && (
        <div className="mt-10 border-t border-slate-100 pt-10">
          <div className="mx-auto max-w-7xl px-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              También te podría interesar
            </h2>
          </div>
          <InfiniteCarousel products={relatedProducts} />
        </div>
      )}
    </section>
  );
}
