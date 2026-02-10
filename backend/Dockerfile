FROM python:3.9-slim
RUN apt-get update && apt-get install -y tor netcat-openbsd curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /app/tor_data && chmod 777 /app/tor_data
EXPOSE 5757
CMD ["python", "main.py"]