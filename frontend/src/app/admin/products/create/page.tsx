"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct } from "@/lib/api/products";
import { PRODUCT_CATEGORIES } from "@/utils/categories";

export default function CreateProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (selectedCategories.length === 0) {
      setError("Debes seleccionar al menos una categoría");
      setLoading(false);
      return;
    }

    try {
      if (!name || !price || !stock) {
        setError("Completa los campos obligatorios (*)");
        setLoading(false);
        return;
      }

      await createProduct({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category: selectedCategories.join(", "),
        image_url: imageUrl,
      });

      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear el producto");
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Crear nuevo producto</h1>
        <Link
          href="/admin/products"
          className="text-slate-200 hover:text-slate-700 text-sm font-medium bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-md transition-colors"
        >
          Cancelar
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Nombre del producto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="Ej: Espada de hierro"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Precio (CLP) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Ej: 9990"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Stock inicial *
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Ej: 50"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            URL de la imagen
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
            placeholder="Detalles del producto..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Categorías *
          </label>
          <div className="relative mb-3">
            <select
              onChange={handleAddCategory}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none appearance-none bg-slate-800 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                -- Agregar categoría --
              </option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  disabled={selectedCategories.includes(cat)}
                  className={
                    selectedCategories.includes(cat)
                      ? "bg-slate-100 text-slate-400"
                      : ""
                  }
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-1 bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm border border-sky-200"
              >
                <span className="capitalize">{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="hover:text-sky-950 ml-1 font-bold focus:outline-none cursor-pointer"
                  aria-label={`Eliminar categoría ${cat}`}
                >
                  ×
                </button>
              </div>
            ))}

            {selectedCategories.length === 0 && (
              <p className="text-sm text-slate-400 italic">
                No hay categorías seleccionadas.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium transition shadow-sm ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 cursor-pointer"
          }`}
        >
          {loading ? "Creando producto..." : "Guardar Producto"}
        </button>
      </form>
    </section>
  );
}
