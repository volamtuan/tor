# Giai đoạn build
FROM node:18-alpine AS builder
WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Đảm bảo thư mục public tồn tại để tránh lỗi COPY
RUN mkdir -p public

# Build ứng dụng
RUN npm run build

# Giai đoạn runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Tạo user không có quyền root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy các file cần thiết từ builder
# Next.js standalone output bao gồm node_modules cần thiết
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 2000

ENV PORT=2000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
