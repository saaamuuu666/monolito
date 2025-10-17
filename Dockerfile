
FROM node:22-bookworm

# Instalar PostgreSQL y dependencias necesarias
RUN apt-get update && apt-get install -y \
    bash gosu postgresql postgresql-contrib postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# AÃ±adir PostgreSQL al PATH
ENV PATH="/usr/lib/postgresql/15/bin:${PATH}"

# Crear directorios necesarios para PostgreSQL
RUN mkdir -p /run/postgresql /var/lib/postgresql/data \
    && chown -R postgres:postgres /var/lib/postgresql /run/postgresql

WORKDIR /app

# Copiar dependencias e instalarlas dentro del contenedor
COPY package*.json ./
RUN npm install --build-from-source


COPY . .


ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=Rumbo2005 \
    POSTGRES_DB=monolito \
    PGDATA=/var/lib/postgresql/data


EXPOSE 3000 5432

# CMD
CMD ["bash", "-c", "gosu postgres bash -c 'initdb -D /var/lib/postgresql/data && pg_ctl -D /var/lib/postgresql/data -o \"-k /run/postgresql\" -w start && psql --command \"CREATE DATABASE ${POSTGRES_DB};\" && node index.js'"]