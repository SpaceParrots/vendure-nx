# Build stage
FROM node:22 AS build-stage
WORKDIR /app

# Copy only necessary files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code and build
COPY . .
RUN npx nx build worker --skip-nx-cache


# Production stage
FROM node:22-slim AS production-stage

# Set environment variables
ENV NODE_ENV=production

WORKDIR /app

COPY --from=build-stage /app/dist/apps/worker ./dist/apps/worker

# Install wget for health checks
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

RUN cd dist/apps/worker && npm install --omit=dev && npm cache clean --force

COPY static ./static

# Extend path to get access to node_modules/.bin scripts
ENV PATH=/app/apps/worker/node_modules/.bin:$PATH

EXPOSE 3123
CMD ["node", "dist/apps/worker/main.js"]
