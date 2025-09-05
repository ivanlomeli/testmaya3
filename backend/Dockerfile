# Usa una versión más reciente de Rust
FROM rust:1.75

WORKDIR /app

# Instala sqlx-cli con una versión compatible
RUN cargo install sqlx-cli --version 0.7.4 --no-default-features --features postgres

# Copia los archivos de configuración de Cargo
COPY Cargo.toml Cargo.lock ./

# Crea un archivo dummy para compilar dependencias
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Compila las dependencias (esto se cachea)
RUN cargo build --release
RUN rm src/main.rs

# Copia el código fuente real
COPY src ./src/
COPY migrations ./migrations/

# Compila la aplicación
RUN cargo build --release

EXPOSE 8080

# Ejecuta las migraciones y luego el servidor
CMD ["sh", "-c", "sqlx migrate run && ./target/release/maya-digital-backend"]