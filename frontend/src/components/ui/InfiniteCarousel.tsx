"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Product } from "@/types/product";

export default function InfiniteCarousel({
  products,
}: {
  products: Product[];
}) {
  const items = [...products, ...products];

  return (
    <div className="relative w-full overflow-hidden bg-slate-50 py-10 border-y border-slate-100">
      <div className="flex gap-6 animate-scroll">
        {items.map((p, index) => (
          <Link
            key={`${p.id}-${index}`}
            href={`/products/${p.id}`}
            className="relative group bg-white w-64 shrink-0 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
          >
            <div className="relative h-48 w-full bg-white p-4 flex items-center justify-center border-b border-slate-50">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  sizes="250px"
                />
              ) : (
                <span className="text-slate-300 text-xs">Sin imagen</span>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-slate-700 font-medium text-sm line-clamp-1 group-hover:text-sky-600 transition-colors">
                {p.name}
              </h3>
              <p className="text-slate-900 font-bold mt-1">
                {formatCurrency(Number(p.price))}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-white to-transparent z-10" />
    </div>
  );
}
