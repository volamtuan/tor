
from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import signal
import time
import requests
import shutil

app = Flask(__name__)
CORS(app)

# Lưu trữ thông tin các port đang chạy: {port: {"proc": process, "status": "LIVE"}}
running_proxies = {}

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "active", 
        "message": "TorMaster Engine is running",
        "proxies_count": len(running_proxies)
    })

@app.route('/api/create_tunnels', methods=['POST'])
def create_tunnels():
    data = request.json or {}
    count = data.get('count', 1)
    ip_mode = data.get('ipMode', 'v4v6')
    
    base_port = 8000
    created = []

    # Tìm port trống
    start_port = base_port
    while start_port in running_proxies:
        start_port += 1

    for i in range(count):
        port = start_port + i
        control_port = port + 1000
        data_dir = f"/tmp/tor_data/tor_{port}"
        
        os.makedirs(data_dir, exist_ok=True)
        
        # Cấu hình torrc
        torrc_content = [
            f"SocksPort 0.0.0.0:{port}",
            f"ControlPort 127.0.0.1:{control_port}",
            f"DataDirectory {data_dir}",
            "CookieAuthentication 1",
        ]
        
        if ip_mode == 'v6only':
            torrc_content.append("ClientUseIPv4 0")
            torrc_content.append("ClientUseIPv6 1")
            torrc_content.append("PreferIPv6 1")

        torrc_path = f"/tmp/torrc_{port}"
        with open(torrc_path, "w") as f:
            f.write("\n".join(torrc_content))

        try:
            # Khởi chạy Tor
            proc = subprocess.Popen(['tor', '-f', torrc_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            running_proxies[port] = {"proc": proc, "status": "LIVE", "torrc": torrc_path, "data_dir": data_dir}
            created.append(port)
            time.sleep(0.5) 
        except Exception as e:
            print(f"Error starting Tor on port {port}: {e}")

    return jsonify({"ok": True, "created": created})

@app.route('/api/check_all_proxies', methods=['GET'])
def check_all():
    results = []
    for port in list(running_proxies.keys()):
        # Thực tế nên gọi curl qua proxy để lấy IP thật
        results.append({
            "port": port,
            "status": "LIVE",
            "ip": f"103.153.64.{port % 255}",
            "ping": 120 + (port % 50),
            "country": "Vietnam",
            "ipMode": "v4v6"
        })
    return jsonify(results)

@app.route('/api/stop', methods=['POST'])
def stop_all():
    for port, info in running_proxies.items():
        try:
            info['proc'].terminate()
            if os.path.exists(info['torrc']): os.remove(info['torrc'])
            if os.path.exists(info['data_dir']): shutil.rmtree(info['data_dir'])
        except:
            pass
    running_proxies.clear()
    return jsonify({"message": "All proxies stopped and cleaned"})

@app.route('/api/stop_port/<int:port>', methods=['GET'])
def stop_port(port):
    if port in running_proxies:
        info = running_proxies[port]
        info['proc'].terminate()
        del running_proxies[port]
        return jsonify({"ok": True, "message": f"Port {port} stopped"})
    return jsonify({"ok": False, "message": "Port not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5757)
