"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Fashion’t Park
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              La mejor tienda de bloques y accesorios del Overworld. Calidad
              premium importada directamente desde el End, Nether y diversos
              Biomas.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://www.linkedin.com/in/benja-envigite/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-700 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24V7.98h5V24H0zM8 7.98h4.78v2.19h.07c.66-1.25 2.28-2.57 4.69-2.57C22.36 7.6 24 10.42 24 15.08V24h-5v-7.98c0-1.9-.03-4.34-2.65-4.34-2.65 0-3.06 2.07-3.06 4.2V24H8V7.98z" />
                </svg>
              </a>

              <a
                href="https://github.com/Envigite"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Catálogo</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="hover:text-sky-400 transition-colors"
                >
                  Ver Todo
                </Link>
              </li>
              <li>
                <Link
                  href="/products?group=construccion"
                  className="hover:text-sky-400 transition-colors"
                >
                  Bloques de Construcción
                </Link>
              </li>
              <li>
                <Link
                  href="/products?group=equipamiento"
                  className="hover:text-sky-400 transition-colors"
                >
                  Equipamiento y Armas
                </Link>
              </li>
              <li>
                <Link
                  href="/products?group=deco"
                  className="hover:text-sky-400 transition-colors"
                >
                  Decoración
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/profile?tab=orders"
                  className="hover:text-sky-400 transition-colors"
                >
                  Estado del pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/help/shipping"
                  className="hover:text-sky-400 transition-colors"
                >
                  Envíos y Entregas
                </Link>
              </li>
              <li>
                <Link
                  href="/help/returns"
                  className="hover:text-sky-400 transition-colors"
                >
                  Política de Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-sky-400 transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-sky-400 transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} Fashion’t Park - Envigite Dev.</p>

          <div className="flex gap-4">
            <Link
              href="/terms"
              className="hover:text-white cursor-pointer transition"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white cursor-pointer transition"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
