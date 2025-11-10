# ===========================
# React + Vite Dev Container
# ===========================
FROM node:22-alpine

WORKDIR /app

# Copy package.json và cài deps
COPY package*.json ./
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Expose cổng Vite (mặc định là 5173)
EXPOSE 5173

# Chạy Vite dev server (cho phép truy cập từ máy ngoài)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
