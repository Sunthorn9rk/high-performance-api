# Use official Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application files
COPY . .

# Expose API port
EXPOSE 3000

# Default command (Fastify API)
CMD ["node", "server.js"]
