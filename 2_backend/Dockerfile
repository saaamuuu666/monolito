# Usa Node.js 18
FROM node:22-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app
COPY . .

# Instala dependencias
RUN npm install

EXPOSE 3000


CMD npm start
