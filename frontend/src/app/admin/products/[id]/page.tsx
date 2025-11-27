"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Product } from "@/types/product";
import { fetchProductById, updateProduct } from "@/lib/api/products";
import { formatCurrency } from "@/utils/formatCurrency";
import { PRODUCT_CATEGORIES } from "@/utils/categories";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [rawPrice, setRawPrice] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProductById(id as string);
        setProduct(data);

        setName(data.name);
        setStock(String(data.stock ?? 0));
        setImageUrl(data.image_url ?? null);
        setDescription(data.description ?? "");
        setRawPrice(String(data.price));

        if (data.category) {
          const cats = data.category
            .split(",")
            .map((c: string) => c.trim())
            .filter((c: string) => c !== "");
          setSelectedCategories(cats);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    if (!selectedCategories.includes(value)) {
      setSelectedCategories([...selectedCategories, value]);
    }
    e.target.value = "";
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== catToRemove));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setRawPrice(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await updateProduct(id as string, {
        name,
        price: rawPrice === "" ? undefined : Number(rawPrice),
        stock: stock === "" ? undefined : Number(stock),
        category: selectedCategories.join(", "),
        image_url: imageUrl,
        description,
      });
      router.push("/admin/products");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const formattedPrice =
    rawPrice === "" ? "" : formatCurrency(Number(rawPrice));

  if (loading)
    return <p className="mt-12 text-center text-slate-400">Cargando...</p>;
  if (!product)
    return (
      <p className="mt-12 text-center text-red-400">Producto no encontrado</p>
    );

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="text-2xl font-bold text-white">Editar producto</h1>
        <button
          onClick={() => router.push("/admin/products")}
          className="text-slate-200 hover:text-slate-700 text-sm font-medium bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Nombre del producto
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Precio
            </label>
            <input
              type="text"
              value={formattedPrice}
              onChange={handlePriceChange}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Categorías
          </label>
          <div className="relative mb-3">
            <select
              onChange={handleAddCategory}
              defaultValue=""
              className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Agregar categoría --
              </option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  disabled={selectedCategories.includes(cat)}
                  className="bg-slate-800 text-slate-100 disabled:text-slate-500"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-1 bg-sky-900/30 text-sky-300 px-3 py-1 rounded-full text-sm border border-sky-800"
              >
                <span className="capitalize">{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="hover:text-white ml-1 font-bold focus:outline-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedCategories.length === 0 && (
              <p className="text-sm text-slate-500 italic">
                Sin categorías seleccionadas.
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            URL Imagen
          </label>
          <input
            value={imageUrl ?? ""}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent min-h-[120px] resize-none"
          />
        </div>
        <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg transition shadow-md cursor-pointer">
          Guardar cambios
        </button>
      </form>

      {errorMsg && (
        <p className="text-red-400 text-sm mt-4 text-center bg-red-900/20 p-3 rounded border border-red-900/50">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
