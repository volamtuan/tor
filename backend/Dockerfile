FROM python:3.9-slim

# Cài đặt Tor và các công cụ cần thiết
RUN apt-get update && apt-get install -y \
    tor \
    netcat-openbsd \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements và cài đặt (nếu có file requirements.txt)
# Ở đây ta cài trực tiếp các thư viện cần thiết
RUN pip install flask flask-cors

COPY . .

# Đảm bảo Tor có quyền ghi vào thư mục data
RUN mkdir -p /var/lib/tor && chown -R root:root /var/lib/tor && chmod -R 700 /var/lib/tor

EXPOSE 5757

# Chạy backend
CMD ["python", "app.py"]
