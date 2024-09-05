from flask import Flask, request, jsonify
from keras.models import load_model
from flask_cors import CORS
import json
import numpy as np
import os
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
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
import datetime
import tempfile
from collections import Counter
import pandas as pd

#test be-2 

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

# Load the trained chatbot model
current_dir = os.path.dirname(os.path.realpath(__file__))
model = load_model(current_dir + "/assets/model_chatbot.h5")

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
with open(current_dir + '/models/chatbot/tokenizer_dict_chatbot.json', 'r') as file:
    word_index = json.load(file)
tokenizer = Tokenizer(oov_token='<OOV>')
tokenizer.word_index = word_index

# Load label encoder
with open(current_dir + '/models/chatbot/result_decoder.json', 'r') as file:
    le_name_mapping = json.load(file)
le = LabelEncoder()
le.classes_ = np.array(list(le_name_mapping.keys()))

# Load responses
with open(current_dir + "/models/chatbot/datasets/dataset_training.json") as file:
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

model_sentence = load_model(current_dir + "/assets/model_sentence.h5")
model_scoring = load_model(current_dir + "/assets/model_scoring.h5")

# Read the dataset
df = pd.read_excel(current_dir +'/models/scoring/dataset.xlsx', sheet_name='main')
df2 = pd.read_excel(current_dir +'/models/scoring/dataset.xlsx', sheet_name='archive')

# Declare a class softmax for label
df_field_values = df['field']

# hitung HANYA jika valuenya unik saja
questionClass = {value: index for index, value in enumerate(df_field_values.unique())}

# Load the common words data from the JSON file
with open(current_dir +'/models/scoring/common_words.json', 'r') as json_file:
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
with open(current_dir + '/models/scoring/tokenizer_dict_struktur.json', 'r') as file:
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

with open(current_dir + '/models/scoring/tokenizer_dict_scoring.json', 'r') as file:
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

'''
Mekanisme pemberian nilai:
1. Score -> total niali akhir setelah dihubungkan dengan dataset dan menggunakan cosine similarity
2. Structure -> kalimat tersebut diawali dengan baik atau tidak
3. Repeat -> berapa kali user mengulang kata yang sama (tingkat fokus)
4. Total -> summary dari 3 nilai tersebut

Struktur kalimat feedback:
1. Summary dari ketiga indeks, tiap indeks memiliki nilai maks 5
2. Scoring, skalanya 0 - 5
3. Struktur kalimat, terdiri dari 2 inputan (0 dan 1)
4. X Repeat, inputan berupa integer (1-10)
'''

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
        self.timestamp = timestamp if timestamp else datetime.datetime.now().isoformat()
        self.rate = rate
        self.sample_ans = sample_ans

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

@app.route('/summary', methods=['POST'])
def save_summary():
    data = request.json
    summary_id = data.get('id')
    summaries[summary_id] = data.get('summary')
    return jsonify({"message": "Summary saved successfully"}), 200

@app.route('/get_summary/<summary_id>', methods=['GET'])
def get_summary(summary_id):
    summary = summaries.get(summary_id)
    if summary:
        return jsonify(summary), 200
    else:
        return jsonify({"message": "Summary not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)