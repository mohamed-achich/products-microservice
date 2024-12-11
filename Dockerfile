# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

ENV NODE_ENV=production

# Add non-root user for security
RUN addgroup -g 1001 nestapp && \
    adduser -S -u 1001 -G nestapp nestapp

WORKDIR /app

COPY --from=builder --chown=nestapp:nestapp /app/dist ./dist
COPY --from=builder --chown=nestapp:nestapp /app/node_modules ./node_modules
COPY --from=builder --chown=nestapp:nestapp /app/package*.json ./

USER nestapp

EXPOSE 5000

CMD ["node", "dist/main"]