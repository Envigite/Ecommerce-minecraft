export type CategoryTree = {
  name: string;
  slug: string;
  subcategories: string[];
};

export const CATEGORY_HIERARCHY: CategoryTree[] = [
  {
    name: "Construcción",
    slug: "construccion",
    subcategories: ["madera", "nieve", "papel", "fabricación", "piedra", "tierra", "arena", "grava", "arcilla", "cristal", "obsidiana", "bloques", "ladrillos"],
  },
  {
    name: "Minería y Metales",
    slug: "mineria",
    subcategories: ["carbón", "hierro", "oro", "diamante", "esmeralda", "lapis-lazuli", "redstone", "cobre", "netherite", "amatista", "cuarzo"],
  },
  {
    name: "Combate y Equipo",
    slug: "equipamiento",
    subcategories: ["armas", "herramientas", "armaduras", "escudos", "arco", "tridente", "ballesta", "espada", "picota", "pala", "azada", "hacha", "casco", "botas", "pantalones", "peto"],
  },
  {
    name: "Alimentos y Cultivos",
    slug: "comida",
    subcategories: ["comida", "cultivos", "semillas", "carne", "pescado", "frutas", "torta", "algas"],
  },
  {
    name: "Alquimia y Pociones",
    slug: "Alquimia",
    subcategories: ["pociones", "encantamientos", "alquimia", "libros", "verruga", "glowstone", "experiencia"],
  },
  {
    name: "Tecnología",
    slug: "redstone",
    subcategories: ["mecanismos", "raíles", "tnt", "fuego", "pistones", "observadores"],
  },
  {
    name: "Drops y Mobs",
    slug: "drops",
    subcategories: ["drop", "cuero", "hilo", "lana", "hueso", "pólvora", "pluma", "tinta", "huevo", "slime", "zombies", "esqueletos", "creepers", "arañas", "enderman", "brujas", "aldeanos", "vacas", "pollos", "ovejas", "abejas", "golem", "piglin", "cubo de magma", "ghast", "guardián", "saqueador", "shulker", "enderdragon", "wither"],
  },
  {
    name: "Decoración",
    slug: "decoracion",
    subcategories: ["decoración", "iluminación", "tinte", "flores", "cuadros", "discos"],
  },
];

export const PRODUCT_CATEGORIES = CATEGORY_HIERARCHY.flatMap(c => c.subcategories);