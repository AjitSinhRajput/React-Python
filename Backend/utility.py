import random
import string
import bcrypt
from fastapi import HTTPException
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from dotenv import load_dotenv,find_dotenv
import os
from cryptography.fernet import Fernet
import base64
from datetime import datetime

def get_encryption_key():
    """
    Function to retrieve the encryption key from environment variables.
    """
 
    load_dotenv(find_dotenv())

    # Access the encryption key
    encryption_key = os.environ['ENCRYPTION_KEY']

    if not encryption_key:
        raise ValueError("Encryption key not found in environment variables.")
    
    return encryption_key

def validate_encryption_key(encryption_key):
    """
    Function to validate the encryption key.
    """
    if len(encryption_key) != 44:
        raise ValueError("Invalid key length. Encryption key must be 44 characters long.")
    
    try:
        Fernet(encryption_key.encode())
    except ValueError:
        raise ValueError("Invalid encryption key. Encryption key must be a valid URL-safe base64-encoded bytes.")

    return True
# Encrypt a password
def encrypt_password(password):

    encryption_key = get_encryption_key()

    if '=' not in encryption_key:
        encryption_key += "="

    # encryption_key += "="
    cipher = Fernet(encryption_key)

    encrypted_password = cipher.encrypt(password.encode())
    encrypted_password = encrypted_password.decode('utf-8')
    return encrypted_password

# Decrypt a password
def decrypt_password(encrypted_password):
    encryption_key = get_encryption_key()

    if '=' not in encryption_key:
        encryption_key += "="
   
    cipher = Fernet(encryption_key)
    decrypted_password = cipher.decrypt(encrypted_password).decode()

    return decrypted_password


# Function to hash a password
def hash_password(password: str) -> str:
    #Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')  # Convert bytes to string

# Function to verify a password against a hashed password
def verify_password(password, hashed_password):
    # hashed_password = bcrypt.hashpw(hashed_password.encode('utf-8'), bcrypt.gensalt())
    # Check if the provided password matches the hashed password
    hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

# Function to generate OTP
def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

# Function to send OTP email
async def send_otp_email(email: str, otp: str):
    # Email configuration
    sender_email = "your_email@example.com"
    sender_password = "your_email_password"
    smtp_server = "smtp.example.com"
    smtp_port = 587  # Change according to your SMTP server configuration

    # Create message
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Your OTP for registration"

    # Body of the email
    body = f"Your OTP for registration is: {otp}"
    message.attach(MIMEText(body, "plain"))

    # Connect to SMTP server and send email
    try:
        async with aiosmtplib.SMTP(hostname=smtp_server, port=smtp_port, use_tls=True) as smtp:
            await smtp.login(sender_email, sender_password)
            await smtp.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send OTP email.")

def convert_datetime(datetime_str):
    # Convert string to datetime object
    dt_object = datetime.fromisoformat(datetime_str)
    
    # Format datetime object as desired string
    formatted_date = dt_object.strftime('%a, %B %d, %Y at %I:%M %p')
    
    return formatted_date