# Node 20 (Alpine es una versión ligera de Linux)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de configuración para aprovechar el caché
COPY package*.json ./
COPY tsconfig.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Compilamos (Ejecuta "tsc && tsc-alias" según package.json)
RUN npm run build

# Exponemos el puerto 4000 (El que usas en tu .env)
EXPOSE 4000

# Comando de inicio (Ejecuta "node dist/index.js")
CMD ["npm", "start"]