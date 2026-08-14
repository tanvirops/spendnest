FROM node:18-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

ARG MONGO_URI
ENV MONGO_URI=$MONGO_URI
ENV NODE_ENV=development

EXPOSE 5000
CMD ["node", "src/server.js"]
