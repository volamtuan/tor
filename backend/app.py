from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import signal
import time
import socket

app = Flask(__name__)
CORS(app)

instances = {}

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

@app.route('/api/deploy', methods=['POST'])
def deploy():
    data = request.json
    count = data.get('count', 1)
    start_port = data.get('start_port', 8000)
    
    new_instances = []
    
    for i in range(count):
        port = start_port + i
        control_port = port + 1000
        
        if is_port_in_use(port):
            continue
            
        # Tạo file cấu hình torrc tạm thời
        torrc_path = f"/tmp/torrc_{port}"
        data_dir = f"/var/lib/tor/instance_{port}"
        os.makedirs(data_dir, exist_ok=True)
        
        with open(torrc_path, 'w') as f:
            f.write(f"SocksPort 0.0.0.0:{port}\n")
            f.write(f"ControlPort {control_port}\n")
            f.write(f"DataDirectory {data_dir}\n")
            f.write(f"CookieAuthentication 0\n")
            f.write(f"ExitRelay 0\n")
            
        # Khởi chạy Tor
        proc = subprocess.Popen(['tor', '-f', torrc_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        instances[port] = {
            'pid': proc.pid,
            'port': port,
            'control_port': control_port,
            'status': 'LIVE'
        }
        new_instances.append(instances[port])
        
    return jsonify({'status': 'success', 'instances': new_instances})

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify(list(instances.values()))

@app.route('/api/kill', methods=['POST'])
def kill_all():
    subprocess.run(['pkill', 'tor'])
    instances.clear()
    return jsonify({'status': 'all_killed'})

@app.route('/api/rotate', methods=['POST'])
def rotate():
    port = request.json.get('port')
    if port in instances:
        control_port = instances[port]['control_port']
        try:
            # Gửi tín hiệu NEWNYM qua telnet/nc để đổi IP
            cmd = f'echo "AUTHENTICATE \"\"\nSIGNAL NEWNYM\nQUIT" | nc localhost {control_port}'
            os.system(cmd)
            return jsonify({'status': 'rotated', 'port': port})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    return jsonify({'status': 'not_found'}), 404

if __name__ == '__main__':
    # Đảm bảo dọn dẹp tor cũ khi khởi động
    subprocess.run(['pkill', 'tor'])
    app.run(host='0.0.0.0', port=5757)
