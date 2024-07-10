from flask import Flask, jsonify, request, render_template, redirect, url_for
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
import jwt
import hashlib
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# MongoDB client setup
client = MongoClient(Config.MONGODB_URI)
db = client.db_interviewgo

# Route to get user data based on the token
@app.route('/api/data', methods=['GET'])
def get_data():
    token_receive = request.cookies.get(Config.TOKEN_KEY)
    try:
        payload = jwt.decode(
            token_receive,
            Config.SECRET_KEY,
            algorithms=['HS256']
        )
        user_info = db.users.find_one({'email': payload.get('id')}, {'_id': False})
        return jsonify(user_info)
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'TokenExpiredError', 'message': 'Your token has expired'}), 401
    except jwt.exceptions.DecodeError:
        return jsonify({'error': 'DecodeError', 'message': 'There was a problem decoding your token'}), 400

# Route for user login
@app.route("/login", methods=["POST"])
def login():
    email = request.json.get('email_give')
    password = request.json.get('password_give')
    pw_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    user = db.users.find_one({'email': email, 'password': pw_hash})

    if user:
        payload = {
            'id': email,
            'exp': datetime.utcnow() + timedelta(days=1)  # Token valid for 24 hours
        }
        token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
        response = jsonify({'result': 'success', 'token': token})
        response.set_cookie(Config.TOKEN_KEY, token, httponly=True, samesite='Strict')
        return response
    else:
        return jsonify({'result': 'fail', 'msg': 'Invalid username or password'}), 401

# Route to Register
@app.route('/register', methods=['POST'])
def sign_up():
    data = request.get_json()
    fullname = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

    # Check for duplicate email
    if db.users.find_one({'email': email}):
        return jsonify({'result': 'fail', 'msg': 'Email already exists!'}), 409

    # Insert data into MongoDB
    db.users.insert_one({'fullname': fullname, 'email': email, 'password': password_hash})
    return jsonify({'result': 'success', 'msg': 'User registered successfully'}), 201

# Route to update user profile
@app.route("/update_profile", methods=["POST"])
def update_profile():
    token_receive = request.cookies.get(Config.TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, Config.SECRET_KEY, algorithms=["HS256"])
        email = payload.get('id')
        
        new_profile = {}
        
        # Update profile name if provided
        name = request.form.get('name_give')
        if name:
            new_profile['profile_name'] = name
        
        # Update profile picture if provided
        if 'file_give' in request.files:
            file = request.files.get('file_give')
            filename = secure_filename(file.filename)
            extension = filename.split('.')[-1]
            file_path = f'profile_pics/{email}.{extension}'
            file.save('./static/' + file_path)
            new_profile['profile_pic'] = filename
            new_profile['profile_pic_real'] = file_path
        
        db.users.update_one({'email': email}, {'$set': new_profile})
        
        return jsonify({'result': 'success', 'msg': 'Profile updated successfully'})
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return jsonify({'result': 'fail', 'msg': 'Authentication failed'}), 401

# Route to save course history
@app.route("/course_history", methods=["POST"])
def save_course_history():
    token_receive = request.cookies.get(Config.TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, Config.SECRET_KEY, algorithms=["HS256"])
        username = payload.get('id')
        course_id = request.form.get('course_id_give')
        timestamp = datetime.utcnow()
        
        db.course_history.insert_one({'username': username, 'course_id': course_id, 'timestamp': timestamp})
        
        return jsonify({'result': 'success', 'msg': 'Course history saved successfully'})
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return jsonify({'result': 'fail', 'msg': 'Authentication failed'}), 401

# Route to get course history
@app.route("/get_course_history", methods=["GET"])
def get_course_history():
    token_receive = request.cookies.get(Config.TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, Config.SECRET_KEY, algorithms=["HS256"])
        username = payload.get('id')
        
        history = list(db.course_history.find({'username': username}, {'_id': False}).sort('timestamp', -1).limit(10))
        
        return jsonify({'result': 'success', 'history': history})
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return jsonify({'result': 'fail', 'msg': 'Authentication failed'}), 401

# Route to save course progress
@app.route("/save_progress", methods=["POST"])
def save_progress():
    token_receive = request.cookies.get(Config.TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, Config.SECRET_KEY, algorithms=["HS256"])
        username = payload.get('id')
        course_id = request.form.get('course_id_give')
        progress = int(request.form.get('progress_give'))
        
        db.course_progress.update_one(
            {'username': username, 'course_id': course_id},
            {'$set': {'progress': progress}},
            upsert=True
        )
        
        return jsonify({'result': 'success', 'msg': 'Progress saved successfully'})
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return jsonify({'result': 'fail', 'msg': 'Authentication failed'}), 401

# Route to get total progress
@app.route("/get_total_progress", methods=["GET"])
def get_total_progress():
    token_receive = request.cookies.get(Config.TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, Config.SECRET_KEY, algorithms=["HS256"])
        username = payload.get('id')
        
        courses = list(db.course_progress.find({'username': username}, {'_id': False, 'progress': True}))
        if not courses:
            return jsonify({'result': 'success', 'total_progress': 0})
        
        total_courses = len(courses)
        total_progress = sum(course['progress'] for course in courses)
        average_progress = total_progress / total_courses
        
        return jsonify({'result': 'success', 'total_progress': average_progress})
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return jsonify({'result': 'fail', 'msg': 'Authentication failed'}), 401

# Route to get interview questions from database
@app.route('/get_questions', methods=['GET'])
def get_questions():
    try:
        questions = list(mongo.db.interview_questions.find({}, {'_id': 0}))  # Ambil semua pertanyaan tanpa _id
        return jsonify({'questions': questions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Run the application
if __name__ == '__main__':
    app.run(debug=True)
