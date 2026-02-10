
from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import signal
import time
import shutil
import socket

app = Flask(__name__)
CORS(app)

# Lưu trữ thông tin các port đang chạy: {port: {"proc": process, "status": "LIVE", "control": control_port}}
running_proxies = {}

def send_tor_command(control_port, command):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("127.0.0.1", control_port))
            s.send(f'AUTHENTICATE ""\r\n'.encode())
            s.recv(1024)
            s.send(f'{command}\r\n'.encode())
            response = s.recv(1024).decode()
            return "250" in response
    except:
        return False

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
            "CookieAuthentication 0", # Tắt auth để dễ command line
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
            proc = subprocess.Popen(['tor', '-f', torrc_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            running_proxies[port] = {
                "proc": proc, 
                "status": "LIVE", 
                "torrc": torrc_path, 
                "data_dir": data_dir,
                "control": control_port
            }
            created.append(port)
            time.sleep(0.2) 
        except Exception as e:
            print(f"Error starting Tor on port {port}: {e}")

    return jsonify({"ok": True, "created": created})

@app.route('/api/newnym/<int:port>', methods=['GET'])
def rotate_ip(port):
    if port in running_proxies:
        control_port = running_proxies[port]['control']
        success = send_tor_command(control_port, "SIGNAL NEWNYM")
        return jsonify({"ok": success, "message": "Signal NEWNYM sent" if success else "Failed to send signal"})
    return jsonify({"ok": False, "message": "Port not found"}), 404

@app.route('/api/check_all_proxies', methods=['GET'])
def check_all():
    results = []
    for port in list(running_proxies.keys()):
        # Mocking IP info for UI - In real use, you'd perform a curl through the proxy
        results.append({
            "port": port,
            "status": "LIVE",
            "ip": f"103.153.64.{port % 255}",
            "ping": 40 + (port % 20),
            "country": "Vietnam",
            "ipMode": "v4v6"
        })
    return jsonify(results)

@app.route('/api/stop_port/<int:port>', methods=['GET'])
def stop_port(port):
    if port in running_proxies:
        info = running_proxies[port]
        try:
            info['proc'].terminate()
            if os.path.exists(info['torrc']): os.remove(info['torrc'])
            if os.path.exists(info['data_dir']): shutil.rmtree(info['data_dir'])
        except: pass
        del running_proxies[port]
        return jsonify({"ok": True, "message": f"Port {port} stopped"})
    return jsonify({"ok": False, "message": "Port not found"}), 404

@app.route('/api/stop', methods=['POST'])
def stop_all():
    for port in list(running_proxies.keys()):
        stop_port(port)
    return jsonify({"message": "All proxies stopped and cleaned"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5757)
