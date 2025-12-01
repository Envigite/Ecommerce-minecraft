"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";
import HeroCarousel from "@/components/ui/HeroCarousel";
import InfiniteCarousel from "@/components/ui/InfiniteCarousel";
import { formatCurrency } from "@/utils/formatCurrency";

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setNewArrivals(data.slice(0, 8));
      } catch (error) {
        console.error("Error loading products", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      <section className="px-4 pt-6">
        <div className="mx-auto max-w-7xl">
          <HeroCarousel />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-slate-100">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-sky-50 rounded-full text-sky-600">
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
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Envíos Rápidos</h3>
              <p className="text-sm text-slate-500">
                Entrega en 24h a todo el mapa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-green-50 rounded-full text-green-600">
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
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Calidad Premium</h3>
              <p className="text-sm text-slate-500">
                Materiales puros, sin mods.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
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
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Precios Justos</h3>
              <p className="text-sm text-slate-500">
                La mejor economía del server.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Categorías Populares
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              name: "Combate",
              img: "/cat-combat.jpg",
              link: "/products?group=combat",
            },
            {
              name: "Construcción",
              img: "/cat-build.jpg",
              link: "/products?group=construccion",
            },
            {
              name: "Comida",
              img: "/cat-food.jpg",
              link: "/products?group=comida",
            },
            {
              name: "Redstone",
              img: "/cat-tech.webp",
              link: "/products?group=redstone",
            },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group relative h-40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />

              <span className="absolute bottom-4 left-4 text-white font-bold text-lg">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recién Llegados</h2>
          <Link
            href="/products"
            className="text-sky-600 font-medium hover:underline text-sm"
          >
            Ver todo
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-48 w-full bg-white p-4 flex items-center justify-center border-b border-slate-50">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      sizes="250px"
                    />
                  ) : (
                    <span className="text-slate-300 text-xs">Sin imagen</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 font-bold">
                    {formatCurrency(Number(p.price))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white py-16 px-8 text-center md:text-left md:px-16 shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-r from-purple-900 to-blue-900 opacity-90" />

          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
              Oferta Limitada
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pack de Inicio Survival
            </h2>
            <p className="text-purple-100 text-lg mb-8">
              Obtén un set completo de herramientas de hierro y comida por un
              precio ridículamente bajo.
            </p>
            <Link
              href="/products"
              className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-slate-100 transition shadow-lg inline-block"
            >
              Ver Ofertas
            </Link>
          </div>
        </div>
      </section>

      {newArrivals.length > 4 && (
        <section>
          <div className="mx-auto max-w-7xl px-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Tendencias del Server
            </h2>
          </div>
          <InfiniteCarousel products={newArrivals} />
        </section>
      )}
    </div>
  );
}
