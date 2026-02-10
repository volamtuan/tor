
FROM python:3.9-slim

# Cài đặt Tor và các phụ trợ
RUN apt-get update && apt-get install -y \
    tor \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Sao chép file yêu cầu và cài đặt thư viện python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn backend
COPY . .

# Tạo thư mục tạm cho các instance Tor
RUN mkdir -p /tmp/tor_data && chmod 777 /tmp/tor_data

# Mở cổng cho API
EXPOSE 5757

# Chạy ứng dụng Flask
CMD ["python", "app.py"]
