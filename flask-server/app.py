from flask import Flask, jsonify, request, Blueprint, current_app, session, send_from_directory, abort
from flask_cors import CORS, cross_origin
from flask_session import Session
from pymongo import MongoClient
from config import Config
from jwt import ExpiredSignatureError, DecodeError
from bson import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from functools import wraps
import hashlib
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from keras.models import load_model
from flask_cors import CORS
import json
import numpy as np
import os
import logging
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder
import re
import nltk
nltk.download('punkt')
import tensorflow as tf
import speech_recognition as sr
from sklearn.feature_extraction.text import CountVectorizer
from nltk.tokenize import word_tokenize
import random
import shutil
import tempfile
from collections import Counter
import pandas as pd
import datetime
from datetime import datetime, timedelta
import uuid


app = Flask(__name__)

# Configure CORS
CORS(app, supports_credentials=True)
app.config.from_object(Config)
Session(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

auth = Blueprint('auth', __name__)\
    
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the upload folder exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# MongoDB client setup
client = MongoClient(Config.MONGO_URI)
db = client.db_interviewgo
sessions = db['sessions']

# Secret key for JWT generation
app.config['SECRET_KEY'] = 'VIEWGO'

# Hashing function for passwords
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            kwargs['current_user'] = data
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token is expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401

    return decorated_function

# Route for user registration
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        fullname = data.get('fullname')
        email = data.get('email')
        password = data.get('password')
        retype_password = data.get('retype_password')

        # Validate input
        if not fullname or not email or not password or not retype_password:
            return jsonify({'result': 'fail', 'msg': 'All fields are required'}), 400

        # Check if passwords match
        if password != retype_password:
            return jsonify({'result': 'fail', 'msg': 'Passwords do not match'}), 400

        # Check if user already exists
        if db.users.find_one({'email': email}):
            return jsonify({'result': 'fail', 'msg': 'User already exists'}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Insert new user into database
        db.users.insert_one({
            'fullname': fullname,
            'email': email,
            'password': hashed_password
        })

        return jsonify({'result': 'success', 'msg': 'User registered successfully'}), 201

    except Exception as e:
        return jsonify({'result': 'fail', 'msg': str(e)}), 500


#Route to Login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = db.users.find_one({'email': email})

        if user and bcrypt.check_password_hash(user['password'], password):
            expires = timedelta(hours=5)
            access_token = create_access_token(identity={
                'email': email,
                'user_id': str(user['_id'])
            }, expires_delta=expires)
            expires_in = expires.total_seconds()

            return jsonify({
                'result': 'success',
                'msg': 'Login successful',
                'token': access_token,
                'expiresIn': expires_in,
                'user_id': str(user['_id'])
            }), 200
        else:
            return jsonify({
                'result': 'fail',
                'msg': 'Invalid email or password'
            }), 401

    except Exception as e:
        logging.error(f"Exception occurred: {e}")
        return jsonify({
            'result': 'fail',
            'msg': str(e)
        }), 500



# Protected Route
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # Get the JWT payload
    jwt_identity = get_jwt_identity()
    # Extract user ID from the payload
    current_user_id = jwt_identity.get('user_id')
    
    # Fetch the user from the database
    user = db.users.find_one({'_id': ObjectId(current_user_id)}, {'_id': False, 'password': False})

    if user:
        return jsonify({'result': 'success', 'user': user}), 200
    else:
        return jsonify({'result': 'fail', 'msg': 'User not found'}), 404

# Route to get user information including email and profile picture
@app.route('/get_user_info', methods=['GET'])
@jwt_required()
@cross_origin(supports_credentials=True)
def get_user_info():
    current_user = get_jwt_identity()
    user_email = current_user.get('email')  # Extract email from JWT payload
    
    user = db.users.find_one({'email': user_email}, {'_id': False, 'password': False})

    if user:
        return jsonify({
            'user': {
                'fullname': user.get('fullname', ''),
                'email': user.get('email', ''),
                'profile_pic_real': user.get('profile_pic_real', '')  # Include profile_pic_real
            }
        })
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    uploads_dir = os.path.join(app.root_path, 'uploads')
    file_path = os.path.join(uploads_dir, filename)
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")  # Debug line
        return jsonify({'message': 'File not found'}), 404
    return send_from_directory(uploads_dir, filename)

# Update Profile
@app.route("/update_profile", methods=["POST"])
@jwt_required()
def update_profile():
    try:
        email = get_jwt_identity()
        new_profile = {}

        # Update profile fullname if provided
        fullname = request.form.get('fullname')
        if fullname:
            new_profile['fullname'] = fullname

        # Update profile picture if provided
        if 'file_give' in request.files:
            file = request.files['file_give']
            if file and file.filename:
                filename = secure_filename(file.filename)
                extension = filename.split('.')[-1]

                # Ensure the file is an image
                if extension.lower() not in ['jpg', 'jpeg', 'png', 'gif']:
                    return jsonify({'result': 'fail', 'msg': 'Unsupported file type'}), 400

                file_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{email}.{extension}')
                file.save(file_path)
                new_profile['profile_pic'] = filename
                new_profile['profile_pic_real'] = f'{email}.{extension}'

        # Debug logging
        print(f"Updating profile for email: {email}")
        print(f"New profile data: {new_profile}")

        # Perform database update
        result = db.users.update_one({'email': email}, {'$set': new_profile})

        # Debug logging
        print(f"Update result: {result.raw_result}")

        # Check if update was successful
        if result.modified_count > 0:
            return jsonify({'result': 'success', 'msg': 'Profile updated successfully'})
        else:
            return jsonify({'result': 'fail', 'msg': 'No changes were made to the profile'})

    except Exception as e:
        # Debug logging
        print(f"Error: {str(e)}")
        return jsonify({'result': 'fail', 'msg': str(e)}), 500


# Route to Logout
@app.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # Invalidate the token by unsetting JWT cookies
    response = jsonify({'msg': 'Logout successful'})
    unset_jwt_cookies(response)
    return response

@app.route('/auth/logout', methods=['OPTIONS'])
def handle_options():
    response = jsonify({'msg': 'Preflight request'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response


# Route to delete user profile
@app.route("/delete_user", methods=["POST"])
def delete_user():
    token_receive = request.cookies.get(Config.TOKEN_KEY)

    if not token_receive:
        return jsonify({'result': 'fail', 'msg': 'Token is missing'}), 401

    try:
        payload = jwt.decode(token_receive, Config.SECRET_KEY, algorithms=["HS256"])
        email = payload.get('id')

        if not email:
            return jsonify({'result': 'fail', 'msg': 'Email not found in token'}), 401

        db.users.delete_one({'email': email})

        return jsonify({'result': 'success', 'msg': 'Profile deleted successfully'})

    except ExpiredSignatureError:
        return jsonify({'result': 'fail', 'msg': 'Token has expired'}), 401
    except DecodeError:
        return jsonify({'result': 'fail', 'msg': 'Token is invalid'}), 401

'''
                    MODEL MACHINE LEARNING
'''

# Load the trained chatbot model
current_dir = os.path.dirname(os.path.realpath(__file__))
# Assuming your machine learning directory is two levels up from flask-server
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
model_path = os.path.join(project_root, "machine-learning", "assets", "model_chatbot.h5")
model = load_model(current_dir + "/../machine-learning/assets/model_chatbot.h5")


blacklist_word = ['saya']
replace_words = [
    ['wawancara', ['interview']],
    ['online', ['daring', 'remote']],
    ['meeting', ['gmeet', 'zoom']],
    ['persiapan',['persiapkan', 'disiapkan','dipersiapkan']],
    ['cv', ['curiculum vitae', 'resume']],
    ['penutup', ['closing statement']],
    ['mereschedule', ['jadwal ulang', 'menjadwalkan ulang', 'mengubah jadwal', 'merubah jadwal', 'pindah jadwal']],
    ['pewawancara', ['hrd', 'recruiter', 'interviewer', 'hr']],
    ['bagus', ['menarik', 'keren', 'tepat']],
    ['kesalahan umum', ['kesalahan kecil']],
    ['pakaian', ['baju', 'setelan', 'kostum', 'berpenampilan']],
    ['stres', ['stress']],
    ['bahasa tubuh', ['gestur', 'gerak tubuh', 'postur']],
    ['kurang', ['minim']],
    ['gugup', ['terbatabata', 'gagap', 'grogi']],
    ['saat', ['dalam proses']],
    ['pekerjaan', ['job']],
    ['hai', ['hello', 'hy', 'helo', 'halo', 'hay', 'p']]
]

def preprocessing_text_chatbot(sentence):
    filtered_words = re.sub(r'[^\w\d\s]', '', sentence.lower())
    words = word_tokenize(filtered_words)

    cleaned_words = []
    for word in words:
        if word in blacklist_word: continue
        replaced = False
        for replacement, target in replace_words:
            if word in target:
                cleaned_words.append(replacement)
                replaced = True
        if not replaced:
            cleaned_words.append(word)

    return ' '.join(cleaned_words)

# Load tokenizer dictionary
with open(current_dir + '/../machine-learning/models/chatbot/tokenizer_dict_chatbot.json', 'r') as file:
    word_index = json.load(file)
tokenizer = Tokenizer(oov_token='<OOV>')
tokenizer.word_index = word_index

# Load label encoder
with open(current_dir + '/../machine-learning/models/chatbot/result_decoder.json', 'r') as file:
    le_name_mapping = json.load(file)
le = LabelEncoder()
le.classes_ = np.array(list(le_name_mapping.keys()))

# Load responses
with open(current_dir + "/../machine-learning/models/chatbot/datasets/dataset_training.json") as file:
    dataset = json.load(file)
responses = {intent['tag']: intent['responses'] for intent in dataset}

@app.route('/predict', methods=['POST'])
def predict_response():
    user_input = request.get_json(force=True)
    question = user_input.get('message')
    input = preprocessing_text_chatbot(question)
    input = tokenizer.texts_to_sequences([input])
    input = np.array(input).reshape(-1)
    input = pad_sequences([input], maxlen=10, padding='post', truncating='pre')
    output = model.predict(input)
    output = output.argmax()
    response_tag = le.inverse_transform([output])[0]
    response = {
        'response': random.choice(responses.get(response_tag, ['Maaf, saya tidak mengerti. Bisa kamu ulangi lagi dengan kata lain?']))
    }
    return jsonify(response)

@app.route('/start_session', methods=['POST'])
@jwt_required()
def start_session():
    try:
        current_user = get_jwt_identity()
        user_id = current_user.get('user_id')  # Extract user_id from JWT token

        session_id = str(uuid.uuid4())
        db.sessions.insert_one({"session_id": session_id, "user_id": user_id})

        logger.info('New session started with ID %s for user %s', session_id, user_id)
        return jsonify({"session_id": session_id}), 200
    except Exception as e:
        logger.error('Error starting session: %s', str(e))
        return jsonify({"error": "Error starting session"}), 500

@app.route('/get_chat_session', methods=['GET'])
@jwt_required()
def get_chat_session():
    try:
        current_user = get_jwt_identity()
        user_id = current_user.get('user_id')

        sessions = db.chat_history.find({'user_id': user_id})
        session_list = [{'session_id': session['session_id']} for session in sessions]

        return jsonify({'sessions': session_list}), 200
    except Exception as e:
        logger.error('Error retrieving chat sessions: %s', str(e))
        return jsonify({"error": "Error retrieving chat sessions"}), 500


@app.route('/send_message', methods=['POST'])
@jwt_required()
def send_message():
    try:
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')
        sender = data.get('sender')

        if not all([session_id, message, sender]) or sender not in ['user', 'bot']:
            logger.warning('Invalid request data: %s', data)
            return jsonify({"error": "Invalid request data"}), 400

        current_user = get_jwt_identity()
        user_id = current_user.get('user_id')  # Extract user_id from JWT token

        timestamp = datetime.utcnow().isoformat()  # Get current UTC time in ISO format

        chat_document = {
            'session_id': session_id,
            'user_id': user_id,
            'messages': [{
                'timestamp': timestamp,
                'sender': sender,
                'content': message
            }]
        }

        # Check if session exists
        existing_chat = db.chat_history.find_one({'session_id': session_id})
        if existing_chat:
            # Append new message to existing chat history
            db.chat_history.update_one(
                {'session_id': session_id},
                {'$push': {'messages': chat_document['messages'][0]}}
            )
            logger.info('Message appended to session %s', session_id)
        else:
            # Create a new session
            db.chat_history.insert_one(chat_document)
            logger.info('New session created with ID %s', session_id)

        return jsonify({'status': 'success'}), 200
    except Exception as e:
        logger.error('Error processing message: %s', str(e))
        return jsonify({"error": "Error processing message"}), 500
    
@app.route('/save_chat_history', methods=['POST'])
@jwt_required()
def save_chat_history():
    data = request.get_json()
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    chat_history = data.get('chat_history')

    print(f"Received data: session_id={session_id}, user_id={user_id}, chat_history={chat_history}")

    if not session_id or not user_id or not chat_history:
        return jsonify({'error': 'Missing data'}), 400

    try:
        if not isinstance(chat_history, list):
            return jsonify({'error': 'Invalid chat history format'}), 400

        for message in chat_history:
            if not isinstance(message, dict) or 'text' not in message or 'sender' not in message or 'time' not in message:
                return jsonify({'error': 'Invalid message format in chat history'}), 400

        db.chat_history.insert_one({
            'session_id': session_id,
            'user_id': user_id,
            'chat_history': chat_history
        })

        return jsonify({'message': 'Chat history saved successfully'}), 200

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debugging statement
        return jsonify({'error': str(e)}), 500



@app.route('/get_chat_history/<session_id>', methods=['GET'])
@jwt_required()
def get_chat_history(session_id):
    try:
        current_user = get_jwt_identity()

        # Debugging: log session_id
        print(f"Fetching chat history for session_id: {session_id}")

        chat_history = db.chat_history.find_one({"session_id": session_id})
        
        # Debugging: log chat_history
        print(f"Fetched chat history: {chat_history}")

        if chat_history:
            return jsonify({"chat_history": chat_history["messages"]}), 200
        else:
            return jsonify({"message": "No chat history found."}), 404
    except ExpiredSignatureError:
        return jsonify({"message": "Token has expired."}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#Delete Chat History
@app.route('/delete_chat_session/<session_id>', methods=['DELETE'])
@jwt_required()
def delete_chat_session(session_id):
    print(f"Received request to delete session ID: {session_id}")
    try:
        session = db.chat_history.find_one({'session_id': session_id})
        print(f"Session found: {session}")
        result = db.chat_history.delete_one({'session_id': session_id})
        print(f"Delete result: {result.deleted_count}")
        if result.deleted_count == 1:
            return jsonify({"message": "Session deleted successfully"}), 200
        else:
            return jsonify({"message": "Session not found"}), 404
    except ExpiredSignatureError:
        return jsonify({"message": "Token has expired."}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# @app.route('/get_chat_history/<user_id>', methods=['GET'])
# def get_chat_history(user_id):
#     messages = list(db.chat_history.find({'user_id': user_id}).sort('timestamp', 1))
#     chat_history = [{
#         'text': msg['message'],
#         'sender': msg['sender'],
#         'time': msg['timestamp'].strftime('%H:%M')
#     } for msg in messages]
#     return jsonify({'messages': chat_history})

model_sentence = load_model(current_dir + "/../machine-learning/assets/model_sentence.h5")
model_scoring = load_model(current_dir + "/../machine-learning/assets/model_scoring.h5")

# Read the dataset
df = pd.read_excel(current_dir +'/../machine-learning/models/scoring/dataset.xlsx', sheet_name='main')
df2 = pd.read_excel(current_dir +'/../machine-learning/models/scoring/dataset.xlsx', sheet_name='archive')

# Declare a class softmax for label
df_field_values = df['field']

# hitung HANYA jika valuenya unik saja
questionClass = {value: index for index, value in enumerate(df_field_values.unique())}

# Load the common words data from the JSON file
with open(current_dir +'/../machine-learning/models/scoring/common_words.json', 'r') as json_file:
    common_word_data = json.load(json_file)

# Separate common words and their frequencies
commonword, frequencies = zip(*[(item['word'], item['count']) for item in common_word_data])

trunc_type='post'
padding_type='post'
oov_tok = "<OOV>"
max_length = 25
max_length_1 = 10

def preprocessing_text(sentence, max_length):
    filtered_words = re.sub(r'[^\w\d\s]', '', sentence.lower())
    # tokenizing
    words = word_tokenize(filtered_words)
    # panjang word sebelum diapus stopwordsnya
    prevLen = len(words)
    # removinfg common words atau stopwords based on dataset
    for i in range(len(commonword)):
        if (len(words) <= max_length): break
        # buat list words baru yang udah gaada stopwordsnya
        words = [word for word in words if word.lower() not in [commonword[i]]]
        if (len(words) == prevLen): break
    return ' '.join(words)

# Load tokenizer dictionary
with open(current_dir + '/../machine-learning/models/scoring/tokenizer_dict_struktur.json', 'r') as file:
    word_index = json.load(file)
tokenizer = Tokenizer(oov_token='<OOV>')
tokenizer.word_index = word_index

def predict(text, treshold=0.5):
    input_sequence = tokenizer.texts_to_sequences([text])
    padded_input = pad_sequences(input_sequence, maxlen=max_length_1, padding=padding_type, truncating=trunc_type)
    predictions = model_sentence.predict(padded_input)
    threshold = 0.5
    predicted_class = 1 if predictions[0][0] > threshold else 0
    return predicted_class

def cosine_similarity(str1, str2):
    arr1 = preprocessing_text(str1, max_length).split(' ');
    arr2 = preprocessing_text(str2, max_length).split(' ');
    common_elements = sorted(list(filter(lambda element: element in arr2, arr1)))
    unique_arr1 = list(filter(lambda element: element not in arr2, arr1))
    unique_arr2 = list(filter(lambda element: element not in arr1, arr2))
    arr1a = common_elements + unique_arr1
    arr2a = common_elements + unique_arr2
    total_same_word = len(arr1) - len(unique_arr1)
    set1 = set(arr1a)
    set2 = set(arr2a)
    count1 = 0
    count2 = 0
    for element in arr1a:
        if element not in set2:
            count1 += 1

    for element in arr2a:
        if element not in set1:
            count2 += 1
    arr1b = arr1a + [None] * count2
    arr2b = arr2a + [None] * count1
    def switch_element_by_index(arr, idx1, idx2):
        arr[idx1], arr[idx2] = arr[idx2], arr[idx1]
    for i in range(len(arr1b)):
        if i < total_same_word:
            continue
        if arr1b[i] is not None and arr2b[i] is not None:
            switch_element_by_index(arr2b, i, len(arr1b) - 1)
    D1 = []
    D2 = []
    for i in range(len(arr1b)):
        if i < total_same_word:
            D1.append(1)
            D2.append(1)
        elif arr1b[i] is None:
            D1.append(0)
            D2.append(1)
        elif arr2b[i] is None:
            D1.append(1)
            D2.append(0)
    D1D2 = 0
    D1Sum = sum(D1)
    D2Sum = sum(D2)
    for i in range(len(D1)):
        D1D2 += D1[i] * D2[i]
    Similarity = D1D2 / (D1Sum ** 0.5 * D2Sum ** 0.5)
    return Similarity

# Label decode function for predict result, ngambil keynya
def get_key_by_value(dictionary, target_value):
    for key, value in dictionary.items():
        if value == target_value:
            return key
    return None

# hitung pengulangan kata yang digunakan oleh user dalam satu kali menjawab, jadi hitung total kata yang unik
def repeat_answer(answer):
    # Inisialisasi CountVectorizer
    vectorizer = CountVectorizer()
    # Fit dan transform teks menjadi matriks istilah-dokumen
    X = vectorizer.fit_transform([answer])
    # Menghitung jumlah total kata
    total_words = X.sum()
    # Menghitung jumlah kata unik
    unique_words = len(vectorizer.get_feature_names_out())
    # Menghitung nilai variasi kata (rasio kata unik terhadap total kata)
    word_variation = unique_words / total_words if total_words > 0 else 0
    word_variation = round(word_variation * 10)
    return word_variation

with open(current_dir + '/../machine-learning/models/scoring/tokenizer_dict_scoring.json', 'r') as file:
    word_index = json.load(file)
tokenizer = Tokenizer(oov_token='<OOV>')
tokenizer.word_index = word_index

def predict_class(text):
    preprocessed_text = preprocessing_text(text, max_length)
    input_sequence = tokenizer.texts_to_sequences([preprocessed_text])
    padded_input = pad_sequences(input_sequence, maxlen=max_length, padding=padding_type, truncating=trunc_type)
    predictions = model_scoring.predict(padded_input, verbose=0)
    top_indices = np.argmax(predictions)
    result = get_key_by_value(questionClass, top_indices)
    return result

# Demo
def scoring(tes_q, tes_a):
    listAnswer = []
    field = ''
    for i in range(len(df['q'])):
      # cari pertanyaan yang match sama pertanyaan yang masuk. kalo sama masuk ke nilai field
        if df['q'][i] == tes_q:
            field = df['field'][i]
            # cari jawaban di kolom answer
            for j in range(len(list(df)[2:])):
                # ambil jawaban
                answer = df[list(df)[2:][j]][i]
                # berhenti kalo kosong
                if pd.isna(answer): break
                # masukkin jawaban yang ada ke list answer
                listAnswer.append(answer)

    # predict kelasnya dulu masuk ke mana
    result_field = predict_class(tes_a)
    if result_field == field:
        result_field = True
    else :
        result_field = False

    scoring_similarity_list = []
    for i in range(len(listAnswer)):
        # bikin list similarity dari semua jawaban yang ada di database
        scoring_similarity_list.append(cosine_similarity(tes_a, listAnswer[i]))
    # cari yang nilainya paling tinggi
    result_similarity = max(scoring_similarity_list)
    # hitung total scorenya
    total_score = result_field * 0.5 + result_similarity * 0.5
    # apakah jawaban sama pertanyaan yang diajukan nyambung
    # print(f"Your answer is {'Relate' if result_field else 'Not Relate'} with a similarity of {result_similarity}")
    # total scorenya
    # print('Total score:', total_score)
    return total_score

summary_res = [
    'Jawabanmu kurang bagus',
    'Jawabanmu belum bagus',
    'Jawabanmu cukup bagus',
    'Jawabanmu sudah bagus',
    'Jawabanmu sudah sangat bagus',
]

scoring_res = [
    'tingkat relatif jawaban dengan pertanyaan yang diberikan tidak tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan kurang tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan cukup tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan sudah tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan sudah sangat tepat',
]

structure_res = [
    'tetapi penyampaian yang kamu berikan kurang tepat',
    'penyampaian yang kamu berikan mudah dipahami',
]

repeat_res = [
    'sebaiknya kamu lebih fokus lagi dalam melakukan simulasi agar bisa memahami pertanyaan yang diberikan',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi cukup baik',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi lumayan baik',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi sudah baik',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi sudah sangat baik',
]

structure = 0
score = 0
repeat = 0
total_score = 0
def generate_feedback(question, answer):
    structure = predict(answer)
    structure_s = 5 if structure == 1 else 0
    score = scoring(question, answer)
    score = round(score * 100/20)
    # Calculate repeat score
    repeat = round(repeat_answer(answer) / 2)

    # menghitung total untuk summary
    rating = round((score + structure_s + repeat) / 3)

    # Compile feedback result
    feedback_result = [
        summary_res[rating - 1],
        scoring_res[score - 1],
        structure_res[structure],
        repeat_res[repeat - 1]
    ]

    feedback_result = ", ".join(feedback_result)
    return rating, feedback_result

user_test_data = []
summaries = {}

class TestEntry:
    def __init__(self, category, question, answer, feedback, rate, sample_ans, timestamp=None):
        self.category = category
        self.question = question
        self.answer = answer
        self.feedback = feedback
        self.timestamp = timestamp # if timestamp else datetime.datetime.now().isoformat()
        self.rate = rate
        self.sample_ans = sample_ans

@app.route('/get_user_id', methods=['GET'])
@jwt_required()
def get_user_id():
    current_user = get_jwt_identity()
    return jsonify({'user_id': current_user['user_id']}), 200
       
#Route to Queestion
@app.route('/questions', methods=['POST'])
def questions():
    data = request.get_json(force=True)
    num = int(data.get('code'))
    df_field_values_unique = df_field_values.unique().tolist()
    field = df_field_values_unique[num]
    questions = []
    sample_ans = []
    while len(questions) < 3:
        filtered_df = df[df['field'] == field]
        sampled_row = filtered_df.sample(1)
        question = str(sampled_row['q'].iloc[0])
        random_column = np.random.choice([f'a{i}' for i in range(1, 21)])
        random_answer = str(sampled_row[random_column].iloc[0])
        if question not in questions:
            sample_ans.append(random_answer)
            questions.append(question)
            user_test_data.append(TestEntry(category=field, question=question, answer= "",
                                            feedback = "", timestamp=None, rate=None, sample_ans= random_answer))
    response = {
        'category': field,
        'questions': questions,
        'sample_ans': sample_ans
    }
    return jsonify(response)
    
@app.route('/answer', methods=['POST'])
def answer():
    r = sr.Recognizer()
    audio = request.files.get('audio')
    question = request.form.get('question')
    if audio:
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, 'temp_audio.wav')
        audio.save(temp_path)
    else:
        return jsonify({"error": "No audio file provided"}), 400
    try:
        with sr.AudioFile(temp_path) as source:
            audio_data = r.record(source)
        # Recognize speech using Google Web Speech API
        answer = r.recognize_google(audio_data, language="id-ID")
        for entry in user_test_data:
            if entry.question == question:
                entry.answer = answer
                break
        response = {
            'answer': answer
        }
    except sr.UnknownValueError:
        response = {
            'error': "Could not understand the audio. Please try again with clearer speech or check for background noise."
        }
    except sr.RequestError:
        response = {
            'error': "Could not request results from Google Web Speech API. Check your internet connection."
        }
    finally:
        shutil.rmtree(temp_dir)
    return jsonify(response)

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json(force=True)
    question = data.get('question')
    answer = data.get('answer')
    gen_fb = generate_feedback(question, answer)
    feedback = gen_fb[1]
    rating = gen_fb[0]
    for entry in user_test_data:
        if entry.question == question and entry.answer == answer:
            entry.feedback = feedback
            entry.rate = rating
            break
    response = {
        'feedback': feedback,
        'answer': answer,
        'rating' : rating
    }
    return jsonify(response)

#Route to Summary
@app.route('/summary', methods=['POST'])
@jwt_required()
def summary():
    data = request.json
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    session_id = data.get('session_id')
    summaries = data.get('summaries')

    if not user_id or not session_id or not summaries:
        return jsonify({"message": "User ID, session ID, and summaries are required"}), 400

    # Save the summary to the database
    result = db.summaries.update_one(
        {'user_id': user_id, 'session_id': session_id},
        {'$set': {'summaries': summaries}},
        upsert=True
    )

    if result.upserted_id:
        message = "Summary saved successfully"
    else:
        message = "Summary updated successfully"

    return jsonify({"message": message}), 200


@app.route('/get_summary/<user_id>/<session_id>', methods=['GET'])
@jwt_required()
def get_summary(user_id, session_id):
    try:
        summary = db.summaries.find_one({'user_id': user_id, 'session_id': session_id})
        if summary:
            summary['_id'] = str(summary['_id'])
            return jsonify(summary), 200
        else:
            return jsonify({"message": "Summary not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@app.route('/save_history', methods=['POST'])
@jwt_required()
def save_history():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    
    # Get data from request JSON
    data = request.get_json()

    # Validate required data
    if not all(k in data for k in ('category', 'grade', 'date', 'session_id')):
        return jsonify({"error": "Category, grade, date, and session_id are required"}), 400

    category = data['category']
    grade = data['grade']
    date_str = data['date']
    session_id = data['session_id']

    # Parse and validate the date
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d')  # Convert date string to datetime
    except ValueError:
        return jsonify({"error": "Invalid date format. Use 'YYYY-MM-DD'"}), 400

    # Prepare history entry
    history_entry = {
        "user_id": user_id,
        "category": category,
        "grade": grade,
        "date": date,
        "session_id": session_id  # Include session_id in the history entry
    }

    # Save to MongoDB
    try:
        result = db.history.update_one(
            {'user_id': user_id, 'category': category, 'date': date},
            {'$set': history_entry},
            upsert=True
        )
        
        if result.upserted_id:
            message = "History entry saved successfully"
        else:
            message = "History entry updated successfully"
        
        return jsonify({"message": message}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Route to Interview History
@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    print(f"Fetching history for user_id: {user_id}")  # Debug line
    
    try:
        # Fetch history entries for the user and filter out those with grade <= 0
        history_entries = db.history.find({"user_id": user_id, "grade": {"$gt": 0}})
        history_list = []
        
        for entry in history_entries:
            entry['_id'] = str(entry['_id'])  # Convert ObjectId to string
            history_list.append(entry)
        
        return jsonify(history_list), 200

    except Exception as e:
        print(f"Error: {str(e)}")  # Debug line
        return jsonify({"error": str(e)}), 500





if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)