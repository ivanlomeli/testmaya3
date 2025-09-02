# --- Stage 1: Build ---
# Usa la última versión de Rust para compatibilidad
FROM rust:latest AS builder

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Copia tu código fuente
COPY . .

# Compila el proyecto en modo release para optimizar el rendimiento
RUN cargo build --release

# --- Stage 2: Production ---
# Usa una imagen base mínima para un contenedor ligero
FROM debian:buster-slim

# Copia el binario compilado desde la etapa de construcción
# IMPORTANTE: Cambia 'maya-digital-platform' si el binario de tu Cargo.toml tiene otro nombre
COPY --from=builder /usr/src/app/target/release/maya-digital-platform /usr/local/bin/maya-digital-platform

# Expone el puerto 8080 que definiste en tu .env
EXPOSE 8080

# Comando para ejecutar tu aplicación
CMD ["maya-digital-platform"]
