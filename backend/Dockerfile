FROM debian:bullseye-slim

# Cài đặt Tor và Python
RUN apt-get update && apt-get install -y \
    tor \
    python3 \
    python3-pip \
    curl \
    net-tools \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài đặt thư viện Python
RUN pip3 install flask flask-cors requests

COPY app.py .

# Cấu hình Tor mặc định
RUN echo "SocksPort 0" >> /etc/tor/torrc
RUN echo "ControlPort 9051" >> /etc/tor/torrc
RUN echo "CookieAuthentication 0" >> /etc/tor/torrc

# Chạy backend
CMD ["python3", "app.py"]
