FROM python:3.9-slim

# Cài đặt Tor và các công cụ cần thiết
RUN apt-get update && apt-get install -y \
    tor \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Tạo thư mục lưu trữ dữ liệu Tor
RUN mkdir -p /tmp/tor_data && chmod 777 /tmp/tor_data

EXPOSE 5757
# Lưu ý: Các cổng socks sẽ được mở động từ 8000+

CMD ["python", "app.py"]
