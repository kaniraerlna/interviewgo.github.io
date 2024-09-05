import pandas as pd
from flask import Flask
from config import Config
from flask_pymongo import PyMongo
import os

app = Flask(__name__)
app.config.from_object(Config)
mongo = PyMongo(app)

def import_questions(file_path):
    try:
        df = pd.read_excel(file_path)
        questions = df['q'].tolist()

        with app.app_context():
            for question in questions:
                interview_question = {'question': question}
                mongo.db.interview_questions.insert_one(interview_question)

        print("Import questions successfully!")
    except Exception as e:
        print(f"Error importing questions: {str(e)}")

if __name__ == '__main__':
    # Construct the full path to dataset.xlsx in the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'dataset.xlsx')
    import_questions(file_path)
