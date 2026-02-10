from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import signal
import time
import requests

app = Flask(__name__)
CORS(app)

# Lưu trữ thông tin các port đang chạy
running_ports = {}

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({"status": "active", "message": "TorMaster Engine is running"})

@app.route('/api/create_tunnels', methods=['POST'])
def create_tunnels():
    data = request.json
    count = data.get('count', 1)
    base_port = 8000
    created = []

    for i in range(count):
        port = base_port + len(running_ports)
        control_port = port + 1000
        
        # Tạo file cấu hình torrc tạm thời
        torrc_content = f"""
SocksPort 0.0.0.0:{port}
ControlPort {control_port}
DataDirectory /tmp/tor_{port}
CookieAuthentication 1
"""
        os.makedirs(f"/tmp/tor_{port}", exist_ok=True)
        with open(f"/tmp/torrc_{port}", "w") as f:
            f.write(torrc_content)

        # Khởi chạy Tor
        proc = subprocess.Popen(['tor', '-f', f"/tmp/torrc_{port}"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        running_ports[port] = {"proc": proc, "status": "LIVE"}
        created.append(port)
        time.sleep(1) # Chờ tor khởi động

    return jsonify({"ok": True, "created": created})

@app.route('/api/check_all_proxies', methods=['GET'])
def check_all():
    results = []
    for port in list(running_ports.keys()):
        results.append({
            "port": port,
            "status": "LIVE",
            "ip": "1.2.3.4", # Fake IP for demo, thực tế sẽ gọi check
            "ping": 150,
            "country": "Vietnam"
        })
    return jsonify(results)

@app.route('/api/stop', methods=['POST'])
def stop_all():
    for port, data in running_ports.items():
        data['proc'].terminate()
    running_ports.clear()
    return jsonify({"message": "All proxies stopped"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5757)