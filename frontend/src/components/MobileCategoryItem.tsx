import { useState } from "react";
import Link from "next/link";
import { CategoryTree } from "@/utils/categories";

export default function MobileCategoryItem({
  cat,
  close,
}: {
  cat: CategoryTree;
  close: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center px-3 py-3 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
      >
        {cat.name}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pl-4 pr-2 pb-2 ml-3 space-y-1 border-l-2 border-slate-100">
            <Link
              href={`/products?group=${cat.slug}`}
              onClick={close}
              className="block px-2 py-1.5 text-sm font-bold text-slate-800 hover:text-sky-600 rounded hover:bg-slate-50 transition-colors"
            >
              Ver todo en {cat.name}
            </Link>

            {cat.subcategories.map((sub: string) => (
              <Link
                key={sub}
                href={`/products?category=${sub}`}
                onClick={close}
                className="block px-2 py-1.5 text-sm text-slate-500 hover:text-sky-600 capitalize rounded hover:bg-slate-50 transition-colors"
              >
                {sub}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
