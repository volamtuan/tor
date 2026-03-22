import os
import subprocess
import time
import signal
import shutil
from flask import Flask, request, jsonify
from flask_cors import CORS
from stem import Signal
from stem.control import Controller

app = Flask(__name__)
CORS(app)

TOR_DATA_DIR = "/app/tor_data"
BASE_PORT = 8000
BASE_CONTROL_PORT = 9000

# Store running instances: { port: { process: proc, control_port: cp } }
instances = {}

@app.route('/deploy', methods=['POST'])
def deploy():
    data = request.json
    count = data.get('count', 1)
    auth_mode = data.get('authMode', 'NONE')
    country = data.get('country', 'Random')
    
    new_ports = []
    for i in range(count):
        port = BASE_PORT + len(instances)
        control_port = BASE_CONTROL_PORT + len(instances)
        
        data_dir = os.path.join(TOR_DATA_DIR, f"tor_{port}")
        os.makedirs(data_dir, exist_ok=True)
        
        torrc_path = os.path.join(data_dir, "torrc")
        with open(torrc_path, "w") as f:
            f.write(f"SocksPort 0.0.0.0:{port}\n")
            f.write(f"ControlPort 127.0.0.1:{control_port}\n")
            f.write(f"DataDirectory {data_dir}\n")
            f.write(f"CookieAuthentication 1\n")
            # Bạn có thể thêm ExitNodes dựa trên country ở đây nếu cần
            
        proc = subprocess.Popen(["tor", "-f", torrc_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        instances[port] = {
            "process": proc,
            "control_port": control_port,
            "status": "LIVE",
            "country": country,
            "authMode": auth_mode
        }
        new_ports.append(port)
        
    return jsonify({"success": True, "ports": new_ports})

@app.route('/instances', methods=['GET'])
def get_instances():
    result = []
    for port, info in instances.items():
        result.append({
            "port": port,
            "status": info["status"],
            "control_port": info["control_port"],
            "country": info["country"],
            "authMode": info["authMode"]
        })
    return jsonify(result)

@app.route('/action', methods=['POST'])
def action():
    data = request.json
    act = data.get('action')
    port = data.get('port')
    
    if port not in instances:
        return jsonify({"error": "Port not found"}), 404
        
    if act == 'rotate':
        try:
            with Controller.from_port(port=instances[port]["control_port"]) as controller:
                controller.authenticate()
                controller.signal(Signal.NEWNYM)
            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    elif act == 'delete':
        proc = instances[port]["process"]
        proc.terminate()
        # Clean up data dir
        data_dir = os.path.join(TOR_DATA_DIR, f"tor_{port}")
        if os.path.exists(data_dir):
            shutil.rmtree(data_dir)
        del instances[port]
        return jsonify({"success": True})
        
    return jsonify({"error": "Invalid action"}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Đường dẫn không tồn tại. Vui lòng kiểm tra lại cổng kết nối API (Cổng 2000)."}), 404

if __name__ == '__main__':
    # Chạy trên cổng 2000 như yêu cầu
    app.run(host='0.0.0.0', port=2000)
