"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: 1,
    title: "Nueva Colección Nether",
    subtitle: "Equípate con lo mejor para el infierno",
    image: "/banner-1.webp",
    link: "/products?group=combat",
    color: "bg-red-900",
  },
  {
    id: 2,
    title: "Herramientas de Diamante",
    subtitle: "Durabilidad y eficiencia garantizada",
    image: "/banner-2.webp",
    link: "/products?category=herramientas",
    color: "bg-sky-900",
  },
  {
    id: 3,
    title: "Construye tu Sueño",
    subtitle: "Ofertas en bloques de construcción y decoración",
    image: "/banner-3.webp",
    link: "/products?group=construccion",
    color: "bg-emerald-900",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrent(current === SLIDES.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? SLIDES.length - 1 : current - 1);
  };

  return (
    <div
      className="relative w-full h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className={`w-full h-full shrink-0 relative ${slide.color}`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />

            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={slide.id === 1}
            />

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
              <h2 className="text-4xl lg:text-6xl font-bold mb-4 drop-shadow-lg tracking-tight">
                {slide.title}
              </h2>
              <p className="text-lg lg:text-2xl mb-8 drop-shadow-md text-slate-100 max-w-2xl">
                {slide.subtitle}
              </p>
              <Link
                href={slide.link}
                className="bg-white text-slate-900 hover:bg-sky-50 font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
              >
                Ver Colección
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute cursor-pointer top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm z-30 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute cursor-pointer top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm z-30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 cursor-pointer rounded-full transition-all duration-300 ${
              current === index
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
