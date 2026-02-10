# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Đảm bảo thư mục public tồn tại để không lỗi khi copy
RUN mkdir -p public
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy các file cần thiết từ stage build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 9002
# Chạy NextJS trên cổng 9002
CMD ["npx", "next", "start", "-p", "9002"]
