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

  const { addItem, items: cartItems } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse font-medium">
          Cargando detalles...
        </p>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 bg-slate-50 rounded-3xl m-4">
        <div className="text-7xl">📦</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-slate-500">
            Es posible que este producto ya no esté disponible.
          </p>
        </div>
        <button
          onClick={() => router.push("/products")}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition font-medium flex items-center gap-2"
        >
          Explorar catálogo
        </button>
      </div>
    );

  const maxStock = product.stock ?? 0;
  const isOutOfStock = maxStock <= 0;

  const validateAndAdd = (redirect: boolean) => {
    if (isOutOfStock) return;

    const itemInCart = cartItems.find((i) => i.id === product.id);
    const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQtyInCart + quantity > maxStock) {
      alert(
        `⚠️ No puedes agregar más. Ya tienes ${currentQtyInCart} en el carrito y solo quedan ${maxStock} disponibles.`
      );
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
    });

    if (redirect) {
      if (isAuthenticated) {
        router.push("/cart");
      } else {
        router.push("/login?redirect=/cart");
      }
    } else {
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <nav className="flex text-sm text-slate-500 mb-8 overflow-hidden whitespace-nowrap text-ellipsis items-center">
        <Link
          href="/"
          className="hover:text-sky-600 transition hover:underline"
        >
          Inicio
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <Link
          href="/products"
          className="hover:text-sky-600 transition hover:underline"
        >
          Productos
        </Link>
        <span className="mx-2 text-slate-300">/</span>
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
                  className={`object-contain transition-transform p-8 duration-500 group-hover:scale-105 ${
                    isOutOfStock ? "grayscale opacity-70" : ""
                  }`}
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
              <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider shadow-xl transform rotate-[-5deg]">
                  Agotado
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="lg:sticky lg:top-24">
            <p className="text-sky-600 font-bold text-xs mb-3 uppercase tracking-widest bg-sky-50 w-fit px-2 py-1 rounded">
              {product.category ? product.category.split(",")[0] : "General"}
            </p>

            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-col gap-1 mb-6 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">
                  {formatCurrency(Number(product.price))}
                </span>

                {!isOutOfStock ? (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                    En Stock
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
                    No disponible
                  </span>
                )}
              </div>

              {!isOutOfStock && maxStock < 5 && (
                <p className="text-sm text-orange-600 font-medium animate-pulse mt-1">
                  🔥 ¡Date prisa! Solo quedan {maxStock} unidades.
                </p>
              )}
            </div>

            <div className="prose prose-slate text-slate-600 mb-8 leading-relaxed">
              <p>
                {product.description ||
                  "Este producto es una excelente adición a tu colección. Fabricado con materiales de alta calidad y diseñado para durar."}
              </p>
            </div>

            <div className="space-y-6">
              {!isOutOfStock ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Cantidad
                    </label>
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white w-max shadow-sm hover:border-slate-400 transition">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-slate-50 rounded-l-xl transition disabled:opacity-30"
                        disabled={quantity <= 1}
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
                            d="M19.5 12h-15"
                          />
                        </svg>
                      </button>

                      <span className="w-12 text-center font-bold text-slate-900 select-none text-lg">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          setQuantity(Math.min(maxStock, quantity + 1))
                        }
                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-slate-50 rounded-r-xl transition disabled:opacity-30"
                        disabled={quantity >= maxStock}
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
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => validateAndAdd(false)}
                      className="flex-1 cursor-pointer bg-white border-2 border-slate-200 hover:border-slate-900 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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
                      onClick={() => validateAndAdd(true)}
                      className="flex-1 bg-slate-900 cursor-pointer hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      Comprar Ahora
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
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <p className="text-slate-900 font-bold mb-1">
                    Este producto está agotado temporalmente.
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    Estamos trabajando para reponerlo lo antes posible.
                  </p>
                  <button className="cursor-pointer text-sky-600 text-sm hover:underline font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
                    🔔 Avísame cuando haya stock
                  </button>
                </div>
              )}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    Envío Rápido
                  </p>
                  <p className="text-xs text-slate-500">
                    Despacho en 24h hábiles
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    Pago Seguro
                  </p>
                  <p className="text-xs text-slate-500">
                    Transacción encriptada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-slate-100 pt-16">
          <div className="mx-auto max-w-7xl mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              También te podría interesar
            </h2>
            <Link
              href="/products"
              className="text-sm font-bold text-sky-600 hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <InfiniteCarousel products={relatedProducts} />
        </div>
      )}
    </section>
  );
}
