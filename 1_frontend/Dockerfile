FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod
EXPOSE 4200
CMD ["npx", "http-server", "dist/frontend/browser", "-p", "4200", "-P", "http://localhost:4200"]