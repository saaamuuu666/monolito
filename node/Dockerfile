FROM node:18

WORKDIR /app

COPY . .
RUN npm install

EXPOSE 3000

CMD node init-db.js && npm start