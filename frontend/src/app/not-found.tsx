"use client";

import Link from "next/link";
import { Pickaxe, Map, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-sky-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
          <Pickaxe className="w-16 h-16 text-sky-500 animate-bounce" />
          <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1.5 rounded-full border border-slate-800">
            <Map className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        ¡Este Chunk no ha cargado!
      </h1>

      <p className="text-slate-400 text-lg max-w-lg mb-8 leading-relaxed">
        Has llegado a los límites del mapa o estás intentando acceder a una zona
        que <strong>aún está en la mesa de crafteo</strong>.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sky-900/20"
        >
          <Home className="w-5 h-5" />
          Volver al Spawn (Inicio)
        </Link>

        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3 rounded-xl font-medium transition-all hover:border-slate-600 border border-transparent"
        >
          Regresar al paso anterior
        </button>
      </div>

      <div className="mt-12 font-mono text-xs text-slate-600">
        Error Code: 404_BIOME_NOT_FOUND
      </div>
    </div>
  );
}
