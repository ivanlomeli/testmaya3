FROM rust:1.70

WORKDIR /app

RUN cargo install sqlx-cli --no-default-features --features postgres

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

COPY src ./src/
COPY migrations ./migrations/

RUN cargo build --release

EXPOSE 8080

CMD ["sh", "-c", "sqlx migrate run && ./target/release/maya-digital-backend"]
