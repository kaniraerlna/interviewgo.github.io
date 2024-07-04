# -*- coding: utf-8 -*-
"""chatbot_models.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1EeJobssgiZxc7Z3i3KQI-Ff_FCfzi6Ha
"""
from contextlib import redirect_stderr

import tensorflow as tf
import pandas as pd
import numpy as np
import json
import random
import re
import nltk
import os
nltk.download('punkt')
from nltk.tokenize import word_tokenize
from tensorflow.keras.preprocessing.text import Tokenizer
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder

current_dir = os.path.dirname(os.path.realpath(__file__))

# Read the dataset
with open(current_dir + "/datasets/dataset_training.json") as file:
  dataset = json.load(file)
with open(current_dir + "/datasets/dataset_validation.json") as file:
  val_dataset = json.load(file)

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

def preprocessing_text(sentence):
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

def processing_json_dataset(dataset):
    tags = []
    inputs = []
    responses={}
    for intent in dataset:
        responses[intent['tag']]=intent['responses']
        for lines in intent['patterns']:
            inputs.append(preprocessing_text(lines))
            tags.append(intent['tag'])
    return [tags, inputs, responses]

def processing_json_val_dataset(dataset):
    tags = []
    inputs = []
    for intent in dataset:
        for lines in intent['patterns']:
            inputs.append(preprocessing_text(lines))
            tags.append(intent['tag'])
    return [tags, inputs]

# Split dataset
[tags, inputs, responses] = processing_json_dataset(dataset)
[val_tags, val_inputs] = processing_json_val_dataset(val_dataset)

# Import tokenizer from word dictionary
tokenizer = Tokenizer(oov_token='<OOV>')

dictionaryToLoad = [
    current_dir + '/word_dict/kaskus.json',
    current_dir + '/word_dict/kompas.json'
]

for dictionary in dictionaryToLoad:
    with open(dictionary, 'r') as file:
        loadedJson = json.load(file).keys()
    tokenizer.fit_on_texts(loadedJson)
word_index = tokenizer.word_index
print(len(word_index))

# Grouping dataset
groupedData = []
for i in range(len(tags)):
    groupedData.append([tags[i], inputs[i], responses[tags[i]]])

val_groupedData = []
for i in range(len(val_tags)):
    val_groupedData.append([val_tags[i], val_inputs[i]])

# Shuffle dataset for better training
random.shuffle(groupedData)
random.shuffle(val_groupedData)

# Resplitting the dataset
train_label = [item[0] for item in groupedData]
train_input = [item[1] for item in groupedData]
val_label = [item[0] for item in val_groupedData]
val_input = [item[1] for item in val_groupedData]

trunc_type = 'pre'
padding_type = 'post'
max_length = 10

tokenizer.fit_on_texts(train_input)
tokenizer.fit_on_texts(val_input)
training_sequences = tokenizer.texts_to_sequences(train_input)
training_padded = pad_sequences(training_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)
validation_sequences = tokenizer.texts_to_sequences(val_input)
validation_padded = pad_sequences(validation_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

le = LabelEncoder()
training_labels = le.fit_transform(train_label)
validation_labels = le.fit_transform(val_label)

# Saving tokenizer dictionary data into json
word_dict = {item[0]: item[1] for item in tokenizer.word_index.items()}
with open(current_dir + '/tokenizer_dict_chatbot.json', 'w') as json_file:
    json.dump(word_dict, json_file, indent=4)

# Saving dataset labels into json
leDecoder = LabelEncoder()
leDecoder.fit(train_label)
le_name_mapping = dict(zip(leDecoder.classes_, leDecoder.transform(leDecoder.classes_)))
transformed_classes = leDecoder.transform(leDecoder.classes_).tolist()
le_name_mapping = dict(zip(leDecoder.classes_, transformed_classes))
with open(current_dir + '/result_decoder.json', 'w') as json_file:
    json.dump(le_name_mapping, json_file, indent=4)

print(f"Training shape: {len(training_padded[0])}")
print(training_padded.shape)
print(f"Validation shape: {len(validation_padded[0])}")
print(validation_padded.shape)

vocabulary = len(tokenizer.word_index)
print("number of unique words : ", vocabulary)
output_length = le.classes_.shape[0]
print("output length: ",output_length)

# GloVe embedding
glove_dir = current_dir + "/glove.6B.100d.txt"
embeddings_index = {}
file_ = open(glove_dir, encoding="utf8")
for line in file_:
    arr = line.split()
    single_word = arr[0]
    w = np.asarray(arr[1:],dtype='float32')
    embeddings_index[single_word] = w
file_.close()
print('Found %s word vectors.' % len(embeddings_index))

max_words = vocabulary + 1
word_index = tokenizer.word_index
embedding_matrix = np.zeros((max_words,100)).astype(object)
for word , i in word_index.items():
        embedding_vector = embeddings_index.get(word)
        if embedding_vector is not None:
            embedding_matrix[i] = embedding_vector

# # Declare graph function and callback class
# def plot_graphs(history, string):
#     plt.plot(history.history[string])
#     plt.plot(history.history['val_'+string])
#     plt.xlabel("Epochs")
#     plt.ylabel(string)
#     plt.legend([string, 'val_'+string])
#     plt.ylim(bottom=0)
#     plt.show()
#
# class Callback(tf.keras.callbacks.Callback):
#     def on_epoch_end(self, epoch, logs={}):
#         if logs.get('val_accuracy') > 0.8 and logs.get('accuracy') > 0.92:
#             self.model.stop_training = True
#
# # Declare the model
# model = tf.keras.Sequential([
#     tf.keras.layers.Input(shape=(training_padded.shape[1],)),
#     tf.keras.layers.Embedding(input_dim=max_words, output_dim=100, weights=[embedding_matrix], trainable=False, mask_zero=True),
#     tf.keras.layers.Dropout(0.3),
#     tf.keras.layers.GRU(128, dropout=0.2, return_sequences=True),
#     tf.keras.layers.LayerNormalization(),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.GRU(128, dropout=0.1, return_sequences=False),
#     tf.keras.layers.LayerNormalization(),
#     tf.keras.layers.Dropout(0.2),
#     tf.keras.layers.Dense(128, activation="relu"),
#     tf.keras.layers.LayerNormalization(),
#     tf.keras.layers.Dense(64, activation="relu"),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.LayerNormalization(),
#     tf.keras.layers.Dense(output_length, activation="softmax")
# ])
# model.summary()
#
# # Compile and training the model
# model.compile(
#     loss="sparse_categorical_crossentropy",
#     optimizer=tf.keras.optimizers.Adam(0.0007),
#     metrics=['accuracy']
# )
# history = model.fit(
#     training_padded,
#     training_labels,
#     epochs=500,
#     batch_size=64,
#     validation_data=(validation_padded, validation_labels),
#     callbacks=[Callback()]
# )
#
# plot_graphs(history, "accuracy")
# plot_graphs(history, "loss")

from flask import Flask, request, jsonify
from keras.models import load_model
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = load_model(current_dir + '/model_chatbot.h5')

@app.route('/predict', methods=['POST'])
def predict():
        user_input = request.get_json(force=True)
        question = user_input.get('message')
        input = preprocessing_text(question)
        input = tokenizer.texts_to_sequences([input])
        input = np.array(input).reshape(-1)
        input = pad_sequences([input], training_padded.shape[1])
        output = model.predict(input)
        output = output.argmax()
        response_tag = le.inverse_transform([output])[0]
        # Check if the response_tag is in responses
        if response_tag in responses:
            response = {
                'response' : random.choice(responses[response_tag])
            }
        else:
            response = {
                'response' : 'Maaf, saya tidak mengerti. Bisa kamu ulangi lagi dengan kata lain?'
            }
        return jsonify(response)


# buat jalanin flasknya
if __name__ == '__main__':
    app.run(debug=True)