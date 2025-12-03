FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install  && npm cache clean --force
COPY . .

EXPOSE 8545
RUN npx hardhat compile
CMD ["npx", "hardhat", "node"]