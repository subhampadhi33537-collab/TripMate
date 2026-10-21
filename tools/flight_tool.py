import os
import re
import certifi
import airportdata
import pycountry
from dotenv import load_dotenv

load_dotenv()

os.environ["SSL_CERT_FILE"]=certifi.where()
os.environ["REQUESTS_CA_BUNDLE"]=certifi.where()

api_key=os.getenv("AVIATIONSTACK_API_KEY")

