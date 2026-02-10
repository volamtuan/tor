FROM python:3.10-slim

# Cài đặt Tor và các phụ trợ
RUN apt-get update && apt-get install -y \
    tor \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Mở các dải cổng cho Tor Proxy (8000-8100)
EXPOSE 5757 8000-8100

CMD ["python", "app.py"]