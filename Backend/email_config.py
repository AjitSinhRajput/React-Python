from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
import os
from dotenv import load_dotenv,find_dotenv


class EmailConfig():
    def __init__(self) -> None:
        #Load environment variables
        load_dotenv(find_dotenv())

        self.conf = ConnectionConfig(
        MAIL_USERNAME =  os.getenv("EMAIL_USERNAME"),
        MAIL_PASSWORD = os.getenv("EMAIL_PASSWORD"),
        MAIL_FROM =  os.getenv("EMAIL_USER"),
        MAIL_PORT = 465,
        MAIL_SERVER = os.getenv("EMAIL_HOST"),
        MAIL_STARTTLS = False,
        MAIL_SSL_TLS = True,
        USE_CREDENTIALS = True,
        VALIDATE_CERTS = True
        )

        self.mail = FastMail(self.conf)
        
    async def send_email(self,email_obj):

        message = MessageSchema(
        subject=email_obj['subject'],
        recipients=email_obj['recipients'],
        body=email_obj['body'],
        subtype=MessageType.html
        )

        try:
            await self.mail.send_message(message)
        except Exception as e:
            print("Failed to send email:", str(e))
            return False
        ...
