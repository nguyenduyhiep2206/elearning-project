FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY package*.json ./
RUN npm install --production && npm cache clean --force

COPY . .
EXPOSE 3000
CMD ["npm", "run","dev"]