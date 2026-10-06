FROM node:20.19-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production

EXPOSE 5000
CMD ["npm", "run", "start"]
