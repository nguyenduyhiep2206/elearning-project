FROM node:20-alpine

# Tao non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cai dat ALL dependencies (bao gom vite trong devDependencies)
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /app

# Chuyen sang non-root user
USER appuser

EXPOSE 5173

# Chay Vite dev server voi host 0.0.0.0 de accessible tu ngoai container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]