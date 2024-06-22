import time
from typing import Dict
import jwt
# from jose import jwt
from dotenv import load_dotenv,find_dotenv
import os
import logging
from datetime import datetime, timedelta
from fastapi import HTTPException,Header
from itsdangerous import URLSafeTimedSerializer
from tzlocal import get_localzone

# Load environment variables
load_dotenv(find_dotenv())


JWT_SECRET = os.getenv("SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

logging.basicConfig(filename='error.log', level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s- %(lineno)d')

def token_response(token: str):
    return {
        "status":1,
        "message":'Welcome to Brewtal.',
        "access_token": token
    }

def signJWT(user_info) -> Dict[str, str]:
    try:
        payload = {
            "user_email": user_info[0]['user_email'],
            "user_id": user_info[0]['user_id'],
            "is_active": user_info[0]['is_active'],
            "user_name": user_info[0]['user_name'],
            "expires": time.time() + 10800 # 3 Hours
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return token_response(token)
    except Exception as e:
         error_message = str(e)
         logging.error(error_message)
         raise HTTPException(status_code=500, detail=error_message)

def decodeJWT(Authorization: str = Header(...)) -> dict:
    token = Authorization
    if token is None:
        raise HTTPException(status_code=401, detail="Authorization header is missing")
    # token = token.split(" ")[1]  # Assuming token is passed as "Bearer <token>"
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.exceptions.DecodeError as e:
          logging.error(f"Token Exception: {str(e)}")
          raise HTTPException(status_code=401, detail="Invalid Token")
    except Exception as e:
         error_message = str(e)
         logging.error(error_message)
         raise HTTPException(status_code=500, detail=error_message)
         
    if decoded_token["expires"] >= time.time():
            return decoded_token
    else:
        raise HTTPException(status_code=401, detail="Token has expired")

def generate_email_token(email, is_user) -> Dict[str, str]:
    try:
        payload = {
            "user_email": email,
            "is_user": is_user,
            "expires": time.time() + 10800 # 3 Hours
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return token_response(token)
    except Exception as e:
         error_message = str(e)
         logging.error(error_message)
         raise HTTPException(status_code=500, detail=error_message)
    
def decode_email_token(token: str) -> dict:
# def decodeJWT(token: str = Header(None)) -> dict:
    if token is None:
        raise HTTPException(status_code=401, detail="Authorization header is missing")
    # token = token.split(" ")[1]  # Assuming token is passed as "Bearer <token>"
    # try:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.exceptions.DecodeError as e:
          logging.error(f"Token Exception: {str(e)}")
          raise HTTPException(status_code=401, detail="Invalid Token")
         
    if decoded_token["expires"] >= time.time():
            return decoded_token
    else:
        logging.error(f"Email activation link is expired!")
        raise HTTPException(status_code=401, detail="Email activation link is expired!")