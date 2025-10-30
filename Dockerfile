# syntax=docker/dockerfile:1

# Etapa de build: instala dependencias (incluyendo dev) y compila TypeScript.
FROM node:20 AS build

WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar la cache de la imagen.
COPY package*.json ./

# Instalamos TODAS las dependencias necesarias para compilar (incluye devDependencies).
RUN npm ci

# Copiamos el resto del código fuente, incluidos los archivos de configuración y el .env.
COPY . .

# Compilamos a JavaScript (genera dist/).
RUN npm run build


# Etapa final: instalamos solo dependencias de producción y copiamos el artefacto compilado.
FROM node:20 AS runtime

WORKDIR /app

# Establecemos el entorno para que npm omita dependencias de desarrollo.
ENV NODE_ENV=production

# Copiamos de nuevo los archivos de dependencias para fijar versiones correctas.
COPY package*.json ./

# Instalamos únicamente las dependencias necesarias en producción.
RUN npm ci --omit=dev

# Copiamos los binarios compilados y recursos necesarios desde la etapa de build.
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./.env

# Exponemos el puerto donde escucha el backend.
EXPOSE 4000

# Comando por defecto para lanzar el servidor.
CMD ["npm", "start"]
