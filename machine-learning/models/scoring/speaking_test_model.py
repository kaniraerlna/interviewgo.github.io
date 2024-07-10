# -*- coding: utf-8 -*-
"""speaking test_model.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1Ho6veqk3WlJMoo34EGg26anT0ei_rRHX

# Good or Bad Answer Prediction
"""
import shutil

import pandas as pd
import numpy as np
import nltk
from nltk.tokenize import word_tokenize
import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from collections import Counter
import matplotlib.pyplot as plt
import json
import re
import random
import speech_recognition as sr
from sklearn.feature_extraction.text import CountVectorizer
import pyaudio
import os
from keras.models import load_model

current_dir = os.path.dirname(os.path.realpath(__file__))

nltk.download('punkt')

# Read the dataset
df = pd.read_excel(current_dir +'/dataset.xlsx', sheet_name='main')
df2 = pd.read_excel(current_dir +'/dataset.xlsx', sheet_name='archive')

"""Pre-processing the Data"""

# Combining the dataset into 1D array or string
# karena mau ambil answerkeynya aja jadi field dan q tidak diajak
answerKey = list(df)[2::]
combinedAnswer = []
for key in answerKey:
    for answer in df[key]:
        if pd.isna(answer): break
        combinedAnswer.append(answer)

# dilihat dari awal dia jawab
badAnswerKey = list(df2)[2::]
combinedBadAnswer = []
for key in badAnswerKey:
    for badAnswer in df2[key]:
      # kalau null
        if pd.isna(badAnswer): break
        combinedBadAnswer.append(badAnswer)

print(f"Total Raw Answer: {len(combinedAnswer)}")
print(f"Total Raw Bad Answer: {len(combinedBadAnswer)}")

# Filtering the good type of answer from both dataset
# the filter is detect a word 'saya' and a coma within 10 first sentences
goodAnswer = []
badAnswer = []
for answer in combinedBadAnswer:
    splitAnswer = answer.split(' ')
    sentence = ' '.join(splitAnswer[:10]).lower()
    if 'saya' in sentence and ',' in sentence:
        goodAnswer.append(sentence)
    else :
        badAnswer.append(sentence)

print(f"Total Good Answer: {len(goodAnswer)}")
print(f"Total Bad Answer: {len(badAnswer)}")
print(goodAnswer[:5])
print(badAnswer[:5])

# set a labels
# 1 untuk good answer dan 0 untuk bad answer
labels = pd.Series(np.concatenate([np.ones(len(goodAnswer)), np.zeros(len(badAnswer))], axis=0))
print("Final Combined Labels:", len(labels))
print(labels)

# combining the good and bad answer
combinedData = np.concatenate((goodAnswer, badAnswer))
print("Final Combined Data:", len(combinedData))
print(combinedData)

# shuffling the answer for good training and validation split
combined = list(zip(combinedData, labels))
random.shuffle(combined)
combined1, combined2 = zip(*combined)
print(combined)

# counting vocabulary size to avoid overfitting
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(combinedData)
print(X)

vocab_size = len(vectorizer.get_feature_names_out())
print("Vocabulary Size:", vocab_size)

training_size = round(len(combinedData) * 0.95)
max_length = 10
embedding_dim = 32

# splitting training and validation data
training_sentences = combinedData[0:training_size]
testing_sentences = combinedData[training_size:]
training_labels = labels[0:training_size]
testing_labels = labels[training_size:]

# converting the data into sequences and give a padding
trunc_type='post'
padding_type='post'
oov_tok = "<OOV>"

tokenizer = Tokenizer(num_words=vocab_size, oov_token=oov_tok)
tokenizer.fit_on_texts(training_sentences)
word_index = tokenizer.word_index

training_sequences = tokenizer.texts_to_sequences(training_sentences)
training_padded = pad_sequences(training_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

testing_sequences = tokenizer.texts_to_sequences(testing_sentences)
testing_padded = pad_sequences(testing_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

training_labels = np.array(training_labels)
testing_labels = np.array(testing_labels)

# Declare graph function
# def plot_graphs(history, string):
#     plt.plot(history.history[string])
#     plt.plot(history.history['val_'+string])
#     plt.xlabel("Epochs")
#     plt.ylabel(string)
#     plt.legend([string, 'val_'+string])
#     plt.ylim(top=1.1, bottom=0)
#     plt.show()
#
# # Declare the model
# model_sentence = tf.keras.Sequential([
#     tf.keras.layers.Embedding(vocab_size+1, embedding_dim, input_length=max_length),
#     # di pooling jadi 1 dimensi
#     tf.keras.layers.GlobalAveragePooling1D(),
#     tf.keras.layers.Dense(16, activation='relu'),
#     tf.keras.layers.Dropout(0.5),
#     # karena cuma nentuin good atau bad, 0 atau 1
#     tf.keras.layers.Dense(1, activation='sigmoid')
# ])
# model_sentence.summary()
#
# model_sentence.compile(loss='binary_crossentropy',optimizer=Adam(0.001), metrics=['accuracy'])
# # verbose itu buat liat training progressnya
# history = model_sentence.fit(training_padded, training_labels, epochs=15, validation_data=(testing_padded, testing_labels), verbose=0)
# plot_graphs(history, "accuracy")
# plot_graphs(history, "loss")
#
# # save model
# model_sentence.save(current_dir +"../../../assets/model_sentence.h5")
#
# def predict(text, treshold=0.5):
#     input_sequence = tokenizer.texts_to_sequences([text])
#     padded_input = pad_sequences(input_sequence, maxlen=max_length, padding=padding_type, truncating=trunc_type)
#     predictions = model_sentence.predict(padded_input)
#     threshold = 0.5
#     predicted_class = 1 if predictions[0][0] > threshold else 0
#     print('Bagus' if predicted_class == 1 else 'Kurang Bagus')
#     return predicted_class
#
# # predict("saya biasanya membuat daftar prioritas untuk menentukan tindakan yang paling mendesak.")
# # predict("Saya adalah orang yang rajin")
# # predict("Ketika saya dihadapkan pada masalah, saya biasanya membuat daftar prioritas untuk menentukan tindakan yang paling mendesak.")
#
# """# Scoring"""
#
# Read the dataset
df = pd.read_excel(current_dir +'/dataset.xlsx', sheet_name='main')
val_df = pd.read_excel(current_dir +'/dataset.xlsx', sheet_name='archive')

# Declare a class softmax for label
df_field_values = df['field']

# hitung HANYA jika valuenya unik saja
questionClass = {value: index for index, value in enumerate(df_field_values.unique())}
print('total class: ' + str(len(questionClass)))
#
# # Combine every answer of each question for training and validation
# dfKey, dfValue = list(df)[0], list(df)[2::]
# answers, labels = [], []
# for i in range(len(dfValue)):
#     for j in range(len(df[dfValue[i]])):
#         answer = df[dfValue[i]][j]
#         if pd.isna(answer): continue
#         answers.append(answer)
#         labels.append(questionClass[df[dfKey][j]])
#
# dfKey, dfValue = list(val_df)[1], list(val_df)[2:5]
# val_answers, val_labels = [], []
# for i in range(len(dfValue)):
#     for j in range(len(val_df[dfValue[i]])):
#         val_answer = val_df[dfValue[i]][j]
#         if pd.isna(val_answer): continue
#         val_answers.append(val_answer)
#         val_labels.append(questionClass[val_df[dfKey][j]])
#
# print(f'Train data: {len(answers)}')
# print(f'Validation data: {len(val_answers)}')
#
# # Counting every word to get the most used word / common word from the dataset
# wordList = []
# for item in answers:
#     words = item.split()
#     for word in words:
#         wordList.append(re.sub(r'[^\w\d\s]', '', word.lower()))
# result = dict(Counter(wordList))
# commonworddata = sorted(result.items(), key=lambda x: x[1], reverse=True)
# print(commonworddata[:3])
#
# # Saving common word data into json
# word_list = [{'word': item[0], 'count': item[1]} for item in commonworddata]
# with open('common_words.json', 'w') as json_file:
#     json.dump(word_list, json_file, indent=4)
#
# # Splitting common word and the frequencies each word into two different array
# commonword, frequencies = zip(*commonworddata)
#
# max_length = 25 #banyaknya common words yang dihilangkan, lebih dari 25 ga diilangin
#
# def preprocessing_text(sentence, max_length):
#     filtered_words = re.sub(r'[^\w\d\s]', '', sentence.lower())
#     # tokenizing
#     words = word_tokenize(filtered_words)
#     # panjang word sebelum diapus stopwordsnya
#     prevLen = len(words)
#     # removinfg common words atau stopwords based on dataset
#     for i in range(len(commonword)):
#         if (len(words) <= max_length): break
#         # buat list words baru yang udah gaada stopwordsnya
#         words = [word for word in words if word.lower() not in [commonword[i]]]
#         if (len(words) == prevLen): break
#     return ' '.join(words)
#
# temp = []
# for answer in answers:
#     temp.append(preprocessing_text(answer, max_length))
# answers = temp
#
# temp = []
# for answer in val_answers:
#     temp.append(preprocessing_text(answer, max_length))
# val_answers = temp
#
# # Counting vocabulary size to avoid overfitting or underfitting
# vectorizer = CountVectorizer()
# X = vectorizer.fit_transform(answers)
# vocab_size = len(vectorizer.get_feature_names_out())
# print("Vocabulary Size:", vocab_size)
#
# # Splitting training and validation data
# training_sentences = answers
# testing_sentences = val_answers
# training_labels = labels
# testing_labels = val_labels
#
# # Converting the data into sequences and give a padding
# trunc_type='post'
# padding_type='post'
# oov_tok = "<OOV>"
#
# tokenizer = Tokenizer(num_words=vocab_size, oov_token=oov_tok)
# tokenizer.fit_on_texts(training_sentences)
# word_index = tokenizer.word_index
#
# training_sequences = tokenizer.texts_to_sequences(training_sentences)
# training_padded = pad_sequences(training_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)
#
# testing_sequences = tokenizer.texts_to_sequences(testing_sentences)
# testing_padded = pad_sequences(testing_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)
#
# training_labels = np.array(training_labels)
# testing_labels = np.array(testing_labels)
#
# # Saving training sentences data into json
# word_dict = {item[0]: item[1] for item in tokenizer.word_index.items()}
# with open('tokenizer_dict_scoring.json', 'w') as json_file:
#     json.dump(word_dict, json_file, indent=4)
#
# # Declare graph function
# def plot_graphs(history, string):
#     plt.plot(history.history[string])
#     plt.plot(history.history['val_'+string])
#     plt.xlabel("Epochs")
#     plt.ylabel(string)
#     plt.legend([string, 'val_'+string])
#     plt.ylim(bottom=0)
#     plt.show()
#
# # declare the model to predict the class
# embedding_dim = 256
# model_scoring = tf.keras.Sequential([
#     tf.keras.layers.Embedding(vocab_size+1, embedding_dim, input_length=max_length),
#     tf.keras.layers.GlobalAveragePooling1D(),
#     tf.keras.layers.Dense(16, activation='relu'),
#     tf.keras.layers.Dense(8, activation='relu'),
#     tf.keras.layers.Dense(len(questionClass), activation='softmax')
# ])
#
# model_scoring.summary()
#
# model_scoring.compile(loss='SparseCategoricalCrossentropy', optimizer=Adam(0.001), metrics=['accuracy'])
# history = model_scoring.fit(training_padded, training_labels, epochs=15, validation_data=(testing_padded, testing_labels), verbose=2)
# plot_graphs(history, "accuracy")
# plot_graphs(history, "loss")
#
# model_scoring.save(current_dir +"../../../assets/model_scoring.h5")

# Define a Cosine Similarity Algorithm
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

model_scoring = load_model(current_dir + '../../../assets/model_scoring.h5')
model_sentence = load_model(current_dir + '../../../assets/model_sentence.h5')

# Predict class
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
    total_score = (result_field * 0.7) + (result_similarity * 0.3)
    # apakah jawaban sama pertanyaan yang diajukan nyambung
    # print(f"Your answer is {'Relate' if result_field else 'Not Relate'} with a similarity of {result_similarity}")
    # total scorenya
    # print('Total score:', total_score)
    return total_score

"""# Feedback"""

'''
1. Display seluruh kategori (display dari database)
2. Tampilkan pertanyaan berdasarkan kategori yang dipilih
3. Nyalakan speech to text (google speech api)
4. Tangkap speech to text
5. Generate skornya
6. Tampilkan feedback
7. Ulangi sampai 3 kali
8. Tampilkan summary semua pertanyaan dan feedback (display dari database)
'''

summary = [
    'Jawabanmu kurang bagus',
    'Jawabanmu belum bagus',
    'Jawabanmu cukup bagus',
    'Jawabanmu sudah bagus',
    'Jawabanmu sudah sangat bagus',
]

scoring_respond = [
    'tingkat relatif jawaban dengan pertanyaan yang diberikan tidak tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan kurang tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan cukup tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan sudah tepat',
    'tingkat relatif jawaban dengan pertanyaan yang diberikan sudah sangat tepat',
]

structure_respond = [
    'tetapi penyampaian yang kamu berikan kurang tepat',
    'penyampaian yang kamu berikan sudah tepat dan mudah dipahami',
]

repeat_respond = [
    'sebaiknya kamu lebih fokus lagi dalam melakukan simulasi agar bisa memahami pertanyaan yang diberikan',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi cukup baik',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi lumayan baik',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi sudah baik',
    'tingkat fokus kamu dalam memahami pertanyaan saat melakukan simulasi sudah sangat baik',
]

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

# repeat_answer("Untuk mencegah masalah yang sama terulang, saya akan mengadakan pertemuan tindakan perbaikan yang melibatkan tim terkait. saya akan mengevaluasi tindakan yang telah diambil untuk mengatasi masalah tersebut dan memastikan implementasi perbaikan yang sesuai. Untuk mencegah masalah baru, saya akan mendorong tim untuk berpikir kritis dan aktif mencari tanda-tanda potensi masalah.")

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
score = 0
structure = 0
repeat = 0
total_score = 0
def get_feedback(question, answer):
  structure = predict(answer)
  score_s = scoring(question, answer)
  score_s = round(score_s * 100/20)
  if score_s <= 2:
    score = 0
  if score_s <= 4:
    score = 1
  if score_s <= 6:
    score = 2
  if score_s <= 8:
    score = 3
  if score_s <= 10:
    score = 4

  repeat_score = repeat_answer(answer)
  if repeat_score <= 2:
    repeat = 0
  if repeat_score <= 4:
    repeat = 1
  if repeat_score <= 6:
    repeat = 2
  if repeat_score <= 8:
    repeat = 3
  if repeat_score >= 10:
    repeat = 4
  feedback_result = []
  # menghitung total untuk sum_tmary
  total_score = score + structure + repeat
  if total_score <= 2:
    total_score = 4
  if total_score <= 4:
    total_score = 3
  if total_score <= 6:
    total_score = 2
  if total_score <= 8:
    total_score = 1
  if total_score >= 10:
    total_score = 0
  feedback_result.append(summary[total_score])
  feedback_result.append(scoring_respond[score])
  feedback_result.append(structure_respond[structure])
  feedback_result.append(repeat_respond[repeat])
  return feedback_result

# q = 'Bagaimana Anda mendefinisikan konsep kuliner yang unik?'
# a = 'Memiliki berbagai pilihan pemasok adalah strategi saya untuk mengurangi risiko ketika ada gangguan pasokan atau kenaikan harga. Ini membantu menjaga fleksibilitas produksi.'
# feedback(q, a)

# generate random question based on field, get the predict score and scoring score based on the answer

from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile

app = Flask(__name__)
CORS(app)

# def generate_question():
#     # ubah dataframe jadi list lalu tampilkan
#     df_field_values_unique = df_field_values.unique().tolist()
#     # minta user pilih kategori berdasarkan array nomor berapa
#     # get kategori di sini, post kategori
#     pick_field = int(input("Masukkan kategori:" ))
#     field = df_field_values_unique[pick_field]
#     # print kategori yang dipilih
#     print("Kategori yang dipilih: {}".format(field))
#     # kumpulkan semua pertanyaan, jawaban, dan feedback
#     questions = []
#     answers = []
#     feedbacks = []
#     # buat perulangan untuk menampilkan 3 pertanyaan dari field yang dipilih
#     # post pertanyaan berdasarkan kategori yang dipilih pake list
#     for i in range(3):
#         # ambil pertanyaan
#         question = str(df[df['field'] == field].sample(1)['q'].iloc[0])
#         questions.append(question)
#         # tampilkan pertanyaan
#         print("Pertanyaan {}: {}".format(i+1, question))
#         answer = speech_to_text()
#         answers.append(answer)
#         # tampilkan feedback
#         print("Feedback: {}".format(feedback(question, answer)))
#         feedbacks.append(feedback(question, answer))
#     # ubah jadi dataframe disajikan tabel
#     summary = pd.DataFrame({
#       'Question': questions,
#       'Answer': answers,
#       'Feedback': feedbacks
#     })
#     print(summary)

import uuid

@app.route('/questions', methods=['POST'])
def generate_question():
    # user_input = request.get_json(force=True)
    # num = user_input.get('code')
    num = 3
    df_field_values_unique = df_field_values.unique().tolist()
    field = df_field_values_unique[num]
    questions = []
    while len(questions) < 3:
        question = str(df[df['field'] == field].sample(1)['q'].iloc[0])
        if question not in questions:
            questions.append(question)
    response = {
        'category': field,
        'questions': questions
    }
    return jsonify(response)

# get question id, samain answer sama question id, terus post ke server
@app.route('/answer', methods=['POST'])
def generate_answer():
    r = sr.Recognizer()
    audio = request.files.get('audio')
    question = request.get('question')
    if audio:
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, 'temp_audio.wav')
        audio.save(temp_path)
    else:
        return jsonify({"error": "No audio file provided"}), 400
    try:
        with sr.AudioFile(temp_path) as source:
            # Adjust for ambient noise and record audio
            r.adjust_for_ambient_noise(source)
            audio_data = r.record(source)
        # Recognize speech using Google Web Speech API
        answer = r.recognize_google(audio_data, lang="id-ID")
        response = {
            'question' : question,
            'answer' : answer
        }
    except r.UnknownValueError:
        response = {
            "error": "Google Web Speech API could not understand the audio"
        }
    finally:
        shutil.rmtree(temp_dir)
    return jsonify(response)

@app.route('/feedback', methods=['GET'])
def predict_feedback():
    question = UserFeedback.Question
    answer = UserFeedback.Answer
    feedback = predict_feedback(question, answer)
    response = {
        'feedback': feedback
    }
    return jsonify(response)

# buat jalanin flasknya
if __name__ == '__main__':
    app.run(debug=True)