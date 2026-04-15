FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/server.js ./
COPY backend/config ./config
COPY backend/controllers ./controllers
COPY backend/middleware ./middleware
COPY backend/routes ./routes
COPY backend/utils ./utils

EXPOSE 3000

CMD ["npm", "start"]
