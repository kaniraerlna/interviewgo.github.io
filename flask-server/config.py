import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'VIEWGO'
    MONGO_URI = os.environ.get('MONGODB_URI') or 'mongodb+srv://daffarach:Kimjisoo95@cluster0.wkwtpvh.mongodb.net/db_interviewgo?retryWrites=true&w=majority'
    SESSION_TYPE = 'filesystem'  # Example session type
    TOKEN_KEY = 'interviewGo'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')  # Menggunakan path relatif
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Limit file uploads to 16MB
    
# # Flask-Mail configuration
#     MAIL_SERVER = 'smtp.example.com'
#     MAIL_PORT = 587
#     MAIL_USE_TLS = False
#     MAIL_USE_SSL = True
#     MAIL_USERNAME = 'your-email@example.com'
#     MAIL_PASSWORD = os.environ.get('PASSWORD')
