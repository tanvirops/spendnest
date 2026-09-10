FROM node:20.19-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ARG MONGO_URI
ENV MONGO_URI=$MONGO_URI
ENV NODE_ENV=production

EXPOSE 5000
CMD ["npm", "run", "start"]
