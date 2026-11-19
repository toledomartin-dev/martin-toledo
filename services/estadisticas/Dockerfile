# Imagen del microservicio de estadísticas.
# Dos etapas: en la primera se instalan las dependencias; la segunda copia solo el resultado.
# Así la imagen final no lleva caché de npm ni archivos que no se usan.

# ---------- Etapa 1: dependencias
FROM node:22-alpine AS deps
WORKDIR /app
# Primero solo los package*.json: si el código cambia pero las dependencias no, Docker
# reutiliza esta capa ya construida y el build tarda segundos.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Etapa 2: la imagen que corre
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
# No correr como root: si alguien vulnera el proceso, tiene menos permisos dentro del contenedor
USER node
EXPOSE 8080
# node directo (no "npm start"): así recibe la señal SIGTERM de Kubernetes y apaga ordenado
CMD ["node", "src/index.mjs"]
