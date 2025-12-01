# Node 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Copias dependencias
COPY package*.json ./

# Instalamos (usamos --legacy-peer-deps por si React 19 da conflictos con alguna librería vieja)
RUN npm install --legacy-peer-deps

# Copiamos el código
COPY . .

# --- MOMENTO CRÍTICO: VARIABLES DE ENTORNO ---
# Next.js necesita saber la URL del backend AL CONSTRUIR LA IMAGEN.
# Definimos un argumento de construcción (ARG)
ARG NEXT_PUBLIC_BACKEND_URL
# Lo convertimos en variable de entorno
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Construimos la app (Genera la carpeta .next)
RUN npm run build

# Exponemos el puerto 3000
EXPOSE 3000

# Iniciamos
CMD ["npm", "start"]