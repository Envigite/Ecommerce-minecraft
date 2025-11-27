"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchProducts } from "@/lib/api/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Productos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link
            href={`/products/${p.id}`}
            key={p.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition hover:scale-105"
          >
            {p.image_url ? (
              <Image
                src={p.image_url}
                alt={p.name}
                width={300}
                height={200}
                className="w-full h-48 object-contain rounded"
              />
            ) : (
              <div className="w-full h-48 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                Sin imagen
              </div>
            )}
            <h2 className="mt-2 text-lg font-medium">{p.name}</h2>
            <p className="text-slate-600">{formatCurrency(Number(p.price))}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
