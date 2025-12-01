"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca bloques, ítems, pociones..."
          className="w-full bg-slate-100 text-slate-900 border border-transparent focus:bg-white focus:border-sky-500 rounded-full py-2.5 pl-5 pr-12 outline-none transition-all shadow-sm focus:shadow-md"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 p-1.5 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition"
          aria-label="Buscar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
