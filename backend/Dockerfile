# Build stage
FROM rust:latest as builder
WORKDIR /app

# Copy Cargo files
COPY Cargo.toml ./

# Create dummy main file
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies first
RUN cargo build --release

# Remove dummy main
RUN rm src/main.rs

# Copy the source code
COPY src ./src

# Copy SQLx offline data if exists
COPY .sqlx ./.sqlx

# Build the application
RUN touch src/main.rs
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/maya-digital-backend /app/
EXPOSE 8080
CMD ["./maya-digital-backend"]