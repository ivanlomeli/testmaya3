# --- Stage 1: Build ---
# Usa Node.js v20 para compatibilidad con react-router
FROM node:20-alpine AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación para producción
RUN npm run build

# --- Stage 2: Production ---
# Usa una imagen de Nginx para servir los archivos estáticos
FROM nginx:stable-alpine

# Copia los archivos construidos desde la etapa anterior al directorio de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Expone el puerto 80 (Nginx escucha en este puerto por defecto)
EXPOSE 80

# Comando para iniciar el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
