from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import db
import random
import time
import base64
# import cv2 # Uncomment for real CV usage
# import numpy as np

app = Flask(__name__)
app.config['SECRET_KEY'] = 'jignasa_secret_key'
CORS(app)
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# --- Auth Routes ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    # In production: Verify password hash from DB
    return jsonify({"token": "jwt_token_example", "role": "student", "name": "John Doe"}), 200

# --- Group Routes ---
@app.route('/api/groups', methods=['GET'])
def get_groups():
    # Mock data - In production: query DB
    return jsonify([
        {"id": 1, "name": "CS-2024-A", "students_count": 42, "code": "JIG-A"},
        {"id": 2, "name": "CS-2024-B", "students_count": 38, "code": "JIG-B"}
    ])

# --- Lecture Routes ---
@app.route('/api/lectures/today', methods=['GET'])
def get_todays_lectures():
    return jsonify([
        {"id": 1, "title": "Data Structures", "start_time": "09:00", "end_time": "10:30", "group_name": "CS-301", "location": "Hall A"}
    ])

# --- Emotion Analysis Logic ---
def analyze_image(base64_img):
    """
    Placeholder for ML Emotion Detection Model.
    In production: Load TensorFlow/PyTorch model here.
    """
    # Simulate processing delay
    # time.sleep(0.05) 
    
    # Mock Result
    emotions = ['Focused', 'Confused', 'Bored', 'Distracted']
    weights = [0.6, 0.15, 0.15, 0.1]
    return random.choices(emotions, weights=weights)[0]

@app.route('/api/emotion/analyze', methods=['POST'])
def analyze_emotion():
    data = request.json
    lecture_id = data.get('lectureId')
    student_id = data.get('studentId')
    image_data = data.get('image')

    # Run Analysis
    detected_emotion = analyze_image(image_data)
    
    # Save to DB (Pseudo-code)
    # cursor = db.get_db().cursor()
    # cursor.execute("INSERT INTO emotion_logs (lecture_id, student_id, emotion) VALUES (%s, %s, %s)", 
    #                (lecture_id, student_id, detected_emotion))
    # db.get_db().commit()

    # Broadcast to Faculty Room for Live Monitor
    socketio.emit('live_analytics_update', {
        'distribution': {
            'focused': random.randint(50, 60), # Mock aggregated stats
            'confused': random.randint(10, 20),
            'bored': random.randint(10, 20),
            'distracted': random.randint(5, 10)
        },
        'engagementScore': random.randint(60, 90)
    }, to=f"faculty_{lecture_id}")

    return jsonify({"status": "success", "emotion": detected_emotion})

# --- WebSocket Events ---
@socketio.on('join')
def on_join(data):
    role = data.get('role')
    lecture_id = data.get('lecture_id')
    
    if role == 'faculty':
        room = f"faculty_{lecture_id}"
        join_room(room)
        print(f"Faculty joined room: {room}")
    else:
        room = f"lecture_{lecture_id}"
        join_room(room)
        print(f"Student joined room: {room}")
        # Notify faculty
        socketio.emit('student_joined', {'id': request.sid, 'name': 'New Student'}, to=f"faculty_{lecture_id}")

@socketio.on('disconnect')
def on_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
