from dotenv import load_dotenv
import os

load_dotenv()  # Loads variables from .env

API_KEY = os.getenv('API_KEY')
# Now you can use API_KEY in your code