import io
import tempfile
from fastapi import Body, FastAPI, Depends, File, Form,Header, Query, UploadFile,Request,WebSocket
from fastapi.responses import FileResponse,JSONResponse, StreamingResponse
from contextlib import asynccontextmanager

import openpyxl
from email_config import EmailConfig
from database import *
from models import *
from utility import generate_otp, hash_password, encrypt_password
# from emaill_config import EmailConfig
from fastapi import HTTPException
from auth_handler import *
from custom_exception import handle_exceptions
from fastapi.middleware.cors import CORSMiddleware
import csv
import io
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
from fastapi.staticfiles import StaticFiles
import re
from dotenv import load_dotenv,find_dotenv
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

#uvicorn main:app --reload
app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup(app)
    yield
    await shutdown(app)

app = FastAPI(
    lifespan=lifespan,
    docs_url="/",
    timeout=600000
    )

# Define the maximum allowed body size in bytes
# The default value is 10000000 (10MB)
MAX_BODY_SIZE = 250000000  # For example, set to 250MB

class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_body_size: int):
        super().__init__(app)
        self.max_body_size = max_body_size

    async def dispatch(self, request: Request, call_next):
        request._starlette_max_request_size = self.max_body_size
        return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #192.168.10.87
    allow_credentials=True,
    allow_methods=["*"],  # You can specify specific HTTP methods (e.g., ["GET", "POST"])
    allow_headers=["*"],  # You can specify specific HTTP headers (e.g., ["Authorization"])
)

# Add trusted host middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Add gzip middleware
app.add_middleware(GZipMiddleware, minimum_size=0)

# Add MaxBodySize middleware
app.add_middleware(MaxBodySizeMiddleware, max_body_size=MAX_BODY_SIZE)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Load environment variables
load_dotenv(find_dotenv())

#Auth Token
@app.post("/api/v1/auth_token", tags=["User"])
async def auth_token(Authorization:str=Header()):
   token = Authorization
   decoded_token = decodeJWT(token)

   user_details = await view_user_details(app,decoded_token['user_id'])
   if decoded_token:
      return {
         'status':1,
         'message':'token_is_still_valid',
         'data': decoded_token,
         'user_details' : user_details
      }

   else:
      raise HTTPException(status_code=404, detail="Token Invalid")

def generate_activation_email(user_name: str, otp: str) -> str:
    return f"""
    <html>
    <body>
        <h1>Activate Your Account, {user_name}!</h1>
        <p>Here is your OTP to activate your account:</p>
        <h2>{otp}</h2>
        <p>If you did not request this, please ignore this email.</p>
    </body>
    </html>
    """

#Register Customer and Send OTP to Email or Mobile
@app.post('/api/v1/register-user', tags=['Admin'])
async def register_admin(user_data: UserRegisteration):
    # Generate OTP
    OTP = generate_otp()
    
    #Hash The Password
    input_pwd = user_data.password
    encrypted_password = encrypt_password(input_pwd)
    user_data.password = encrypted_password

    try:
        # Save OTP to the database (you need to implement this)
        is_executed = await register_user_db(app, user_data, OTP)
    except HTTPException as e:
        print("Caught HTTPException:", e.detail)
        raise HTTPException(status_code=500, detail=str(e.detail))

    if is_executed:
        # Generate activation token
        token = generate_email_token(user_data.user_email, is_user=False)
       
        activation_link =  f"/activelink?token={token['access_token']}"

        # Instead of generating activation link, send OTP in email
        email_body = generate_activation_email(user_data.user_name, OTP)

        # Email details
        email_obj = {
            "subject": "Activate Your Account",
            "recipients": [user_data.user_email],
            "body": email_body,
        }

        # Send the email
        email_init = EmailConfig()
        await email_init.send_email(email_obj=email_obj)
        
        return {
            'status': 1,
            'activation_link':activation_link,
            "message": "OTP sent to email for account activation",
        }
    else:
        raise HTTPException(status_code=500, detail="There's a Problem Registering User")

# Endpoint for OTP verification and user creation
@app.post("/api/v1/verify-email-token", tags=['Email'])
async def verify_email_and_create_user(token:str):
    decoded_token = decode_email_token(token)
    if decoded_token:
        is_user = decoded_token['is_user']
        
        try:
            # Insert User
            user_id = await activate_user(app,decoded_token['user_email'])

            # await init_contact_master_fields(app,user_id)

            return {'status':1,
                    'message':'Email is Verified!',
                    'is_user': decoded_token['is_user'],
                    'user_email': decoded_token['user_email']
                    }
        except HTTPException as e:
            print("Caught HTTPException:", e)
            raise HTTPException(status_code=500, detail="Email is already verified!")
    
    else:
        raise HTTPException(status_code=400, detail="Token Expired!.")

@app.post("/api/v1/verify-otp", tags=['OTP'])
async def verify_otp(verify_otp:VerifyOTP):
    try:
        verify_otp = verify_otp

        is_verified = await verify_otp_db(
            app,
            verify_otp.user_email,
            verify_otp.otp)
        
        if is_verified:
            
            user_info = await fetch_user_details_otp(app,verify_otp.user_email)
            token = signJWT(user_info)
            return token
        else:
            raise HTTPException(status_code=500, detail="Incorrect OTP!")
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/register-user-pwd", tags=["User"])
async def register_pwd(user_data:UserLogin):

    # Hash The Password
    input_pwd = user_data.password
    # hashed_pwd = hash_password(input_pwd)
    encrypted_password = encrypt_password(input_pwd)
    user_data.password = encrypted_password

    try:
        user_info = await register_pwd_db(app,user_data)

        token = signJWT(user_info)
        token['user_info'] = user_info
        
        return token
    except HTTPException as e:
        print("Caught HTTPException:", e)
        raise HTTPException(status_code=500, detail=str(e.detail))
   
# @app.post("/api/v1/resend-activation-mail", tags=['Email'])
# async def resend_activation_mail(first_name:str,user_email:str,decoded_token: dict = Depends(decodeJWT)):
#     try:
#         # Generate activation token
#         token = generate_email_token(user_email, is_user=True)

#         activation_link =  f"{os.environ['REACT_URL']}/activelink?token={token['access_token']}"

#         #Brevo Activation Link
#         # account_activation.send_email(user_name=first_name, activation_link=activation_link,email=user_email)

#         return {
#             'status':1,
#             "message": "Activation email sent"
#                 }
#     except Exception as e:
#         logging.error(f"Database Error: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/v1/login", tags=["User"])
async def user_login(user_data:UserLogin):
    try:
        user_count = await user_exists_db(app, user_data.user_email)
        if user_count:

            user_info = await verify_credentials_db(app,user_data)
            token = signJWT(user_info)
            return token,user_info
        
        else:
            raise HTTPException(status_code=404, detail="Email doesn't exist!")
        
    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e.detail))

#Send OTP
# @app.post("/api/v1/login", tags=["User"])
# async def user_login(user_data:UserLogin):
#     try:
#         user_count,customer_count = await user_exists_db(app, user_data.email)
#         if user_count[0] or customer_count[0]:

#             OTP = generate_otp()

#             first_name = await set_otp_db(app, user_data.email,OTP)

#             # send_otp_brevo.send_email(user_data.email,OTP,first_name)

#             return {
#                 'status':1,
#                 "message": "OTP hase been sent to your Email",
#                 'email' : user_data.email
#                     }

            

#             # user_info,user_rights = await verify_credentials_db(app,user_data)
#             # token = signJWT(user_info)
#             # if user_rights:
#             #     token["user_rights"] = user_rights
#             # return token
#         elif user_count[1] or customer_count[1]:
#             raise HTTPException(status_code=404, detail="Some Error message!") 
#         else:
#             raise HTTPException(status_code=404, detail="Email don't exist!")
        
#     except HTTPException as e:
#         raise HTTPException(status_code=500, detail=str(e.detail))

# @app.post("/api/v1/edit-user", tags=["User"])
# async def edit_user(user_data:UserRegisteration,decoded_token: dict = Depends(decodeJWT)):
#     try:
#         user_id = decoded_token['user_id']

#         is_executed = await edit_user_db(app, user_data,user_id)

#         if is_executed:
#             return {
#                 'status': '1',
#                 'message':'User Edited Successfully'
#             }
#     except HTTPException as e:
#         print("Caught HTTPException:", e)
#         raise HTTPException(status_code=500, detail=str(e.detail))


@app.patch("/api/v1/edit-user", tags=["User"])
async def edit_user(user_data:UserProfileEdit,decoded_token: dict = Depends(decodeJWT)):
    try:
        user_id = decoded_token['user_id']

        is_executed = await edit_user_db(app, user_data,user_id)

        if is_executed:
            return {
                'status': '1',
                'message':'User Edited Successfully'
            }
    except HTTPException as e:
        print("Caught HTTPException:", e)
        raise HTTPException(status_code=500, detail=str(e.detail))

@app.get("/api/v1/view-user", tags=["User"])
async def view_user_data(decoded_token: dict = Depends(decodeJWT)):
    try:
        user_id = decoded_token['user_id']
        user_details = await view_user_details(app,user_id)
        return user_details
    except HTTPException as e:
        print("Caught HTTPException:", e)
        raise HTTPException(status_code=500, detail=str(e.detail))

@app.post("/api/v1/delete-user/{user_id}", tags=["User"])
async def delete_user_data(user_id:int,decoded_token: dict = Depends(decodeJWT)):
    try:
        is_deleted = await delete_user(app,user_id)
        if is_deleted:
            return {
                'status':'1',
                'message': 'User Deleted!'
            }
    except HTTPException as e:
        print("Caught HTTPException:", e)
        raise HTTPException(status_code=500, detail=str(e.detail))

# @app.get("/api/v1/all_users", tags=["User"])
# async def all_users(page:int, page_size:int,decoded_token: dict = Depends(decodeJWT)):
#     try:
#         total_users, users_data = await list_all_users(app,page,page_size,decoded_token['admin_id'])
#         return {'status':1,
#                 'message': 'Data Successfully loaded',
#                 'data' : users_data,
#                 'count':total_users
#                 }
#     except HTTPException as e:
#         print("Caught HTTPException:", e)
#         raise HTTPException(status_code=500, detail=str(e.detail))
  
@app.patch("/api/v1/change-pwd", tags=["User"])
async def change_pwd(change_pwd:ChangePWD,decoded_token: dict = Depends(decodeJWT)):
    try:
        user_id = decoded_token['user_id']

        # is_verified = await verify_old_pwd(app,user_id,change_pwd.old_password)

        # if is_verified:
        if True:
            #Hash The Password
            new_password = change_pwd.new_password
            encrypted_password = encrypt_password(new_password)
            new_password = encrypted_password

            is_updated = await set_new_pwd(app,user_id, new_password)

            if is_updated:
                return {
                    "status":1,
                    "message":"Password is changed!"
                }
        else:
           raise HTTPException(status_code=500, detail="Old password is incorrect!")

    except HTTPException as e:
        print("Caught HTTPException:", e)
        raise HTTPException(status_code=500, detail=str(e.detail))


#password reset
# @app.post("/api/v1/forgot-password-email", tags=['Forgot Password'])
# async def forgot_pass_email(forgot_pwd:ForgotPWD):
#     try:
#         forgot_pwd = forgot_pwd.model_dump()

#         user_count,customer_count = await user_exists_db(app, forgot_pwd['email'])

#         first_name = await fetch_username_from_email(app, forgot_pwd['email'])
#         if user_count[0]:
#             is_user=True
#         elif customer_count[0]:
#             is_user=False

#         if user_count[0]:

#             # Generate activation token
#             token = generate_email_token(forgot_pwd['email'], is_user=is_user)
        
#             activation_link =  f"{os.environ['REACT_URL']}/reset-password?token={token['access_token']}"

#             #Brevo Activation Link
#             # forgot_pwd_email.send_email(activation_link=activation_link,name=first_name,email=forgot_pwd['email'])

#             return {
#                 'status':1,
#                 "message": "Reset Password Link Sent"
#                 }
#         else:
#             raise HTTPException(status_code=404, detail="Email don't exist!")
#     except Exception as e:
#         logging.error(f"Database Error: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/forgot-password-email", tags=['Forgot Password'])
async def forgot_pass_email(forgot_pwd: ForgotPWD):
    try:
        forgot_pwd = forgot_pwd.model_dump()
        
        # Check if the user or customer exists
        # user_count,customer_count = await user_exists_db(app, forgot_pwd['email'])
        user_count = await user_exists_db(app, forgot_pwd['email'])

        # Fetch user's first name
        # Determine if it's a user or customer
        if user_count:
            is_user = True
        # elif customer_count:
        #     is_user = False
        else:
            raise HTTPException(status_code=404, detail="Email does not exist!")

        first_name = await fetch_username_from_email(app, forgot_pwd['email'])
        # Generate OTP for password reset
        OTP = generate_otp()
        is_otp_updated = await update_otp_db(app,forgot_pwd['email'],OTP)

        if is_otp_updated is not None:
            # Instead of generating activation link, send OTP in email
            email_body = generate_activation_email(first_name, OTP)

            # Email details
            email_obj = {
                "subject": "Reset Your Password",
                "recipients": [forgot_pwd['email']],
                "body": email_body,
            }

            # Send the email
            email_init = EmailConfig()
            await email_init.send_email(email_obj=email_obj)

            # Generate activation token for resetting password
            token = generate_email_token(forgot_pwd['email'], is_user=False)

            # Construct activation link (assuming REACT_URL is defined in your environment)
            # activation_link = f"{os.environ['REACT_URL']}/reset-password?token={token['access_token']}"
            # print(token)
            return {
                'status': 1,
                'token': token['access_token'],
                'user_email': forgot_pwd['email'],
                "message": "OTP has been sent to your email."
            }
        else:
            raise HTTPException(status_code=404, detail="OTP is not updated!")

    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/v1/verify-pwd-token", tags=['Forgot Password'])
async def verify_email_and_change_pwd(token:str):
    decoded_token = decode_email_token(token)
    if decoded_token:
        is_user = decoded_token['is_user']
        # if is_user:
        try:

           return {'status':1,
                        'message':'Token is Valid!',
                        'is_user': decoded_token['is_user'],
                        'user_email': decoded_token['user_email']
                        }
        except HTTPException as e:
            print("Caught HTTPException:", e)
            raise HTTPException(status_code=500, detail="Email is already verified!")
    # else:
    #     ...
    else:
        raise HTTPException(status_code=400, detail="Token Expired!.")

@app.post("/api/v1/reset-pwd", tags=['Forgot Password'])
async def reset_pwd(change_pwd:ChangePWD):
    try:
        change_pwd = change_pwd.model_dump()
        new_password = change_pwd['new_password']
        encrypted_password = encrypt_password(new_password)
        new_password = encrypted_password

        is_updated = await reset_pwd_db(app,change_pwd['email'],new_password)

        if is_updated:
            return "Password is changed!"
        
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

#API For List

@app.post("/api/v1/insert-list", tags=['List'])
async def insert_list(lists:Lists,decoded_token: dict = Depends(decodeJWT)):
    try:
        
        is_inserted = await insert_list_db(app,lists,decoded_token['user_id'])

        if is_inserted:
            return {
                'message': 'List Inserted successfully.',
                'status': 1
            }
        else:
            return{
                'message': ' List is not Inserted.',
                'status': 0
            }
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/v1/update-list", tags=['List'])
async def update_list(list_id : int,lists : Lists,decoded_token: dict = Depends(decodeJWT)):
    try:
        
        is_updated = await update_list_db(app,lists,list_id,decoded_token['user_id'])

        if is_updated:
            return {
                'message': 'List Updated successfully.',
                'status': 1
            }
        
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/get-all-lists", tags=['List'])
async def get_lists(
    page: int,
    page_size: int,
    statuses: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    decoded_token: dict = Depends(decodeJWT)
):
    try:
        # Call the function to get lists from the database
        lists, total_count = await get_lists_db(app, decoded_token['user_id'], page, page_size, statuses, search)
        
        if lists:
            return {
                'lists': lists,
                'total_count': total_count,
                'message': 'Lists retrieved successfully.',
                'status': 1
            }
        else:
            return {
                'message': 'Empty Lists.',
                'status': 1
            }
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/export-all-lists", tags=['List'])
async def export_lists(format: str, decoded_token: dict = Depends(decodeJWT)):
    try:
        lists = await export_lists_db(app, decoded_token['user_id'])
        IP_ADDR = os.getenv("FILE_IP")
        export_dir = 'D:/Ajit React Python Custom/Backend/static/export_temp/'
        

        if lists:
            if format == 'excel':
                file_name = 'exported_lists.xlsx'
                # Create an Excel workbook and sheet
                wb = openpyxl.Workbook()
                ws = wb.active
                ws.title = "Lists"
                
                # Write the header
                headers = ["ID", "Name", "Status", "Description"]
                ws.append(headers)
                
                # Write the data
                for list_item in lists:
                    ws.append([list_item["id"], list_item["name"], list_item["status"], list_item["description"]])
                
                os.makedirs(export_dir, exist_ok=True)

                # Save the workbook to a temporary file in the specified directory
                temp_file_path = os.path.join(export_dir,file_name)
                wb.save(temp_file_path)
                
                temp_file_path = f"{IP_ADDR}/{file_name}"
                # Return the file path as a response
                return {"file_path": temp_file_path}
            
            elif format == 'csv':
                file_name = 'exported_lists.csv'
                # Specify the directory path to store the file
                # export_dir = 'D:/Ajit React Python Custom/Backend/static/export_temp/'
                os.makedirs(export_dir, exist_ok=True)
                
                # Create a CSV file
                temp_file_path = os.path.join(export_dir, file_name)
                with open(temp_file_path, mode='w', newline='') as temp_file:
                    csv_writer = csv.writer(temp_file)
                    
                    # Write header
                    csv_writer.writerow(["ID", "Name", "Status", "Description"])
                    
                    # Write data
                    for list_item in lists:
                        csv_writer.writerow([list_item["id"], list_item["name"], list_item["status"], list_item["description"]])

                temp_file_path = f"{IP_ADDR}/{file_name}"
                # Return the file path as a response
                return {"file_path": temp_file_path}
            
            else:
                raise HTTPException(status_code=400, detail='Invalid format specified. Use "excel" or "csv".')
        
        else:
            return {
                'message': 'Empty Lists.',
                'status': 1
            }
    
    except Exception as e:
        logging.error(f"Error exporting lists: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/v1/get-list", tags=['List'])
async def get_list(list_id: int,decoded_token: dict = Depends(decodeJWT)):
    try:
        
        list = await get_list_by_id_db(app,list_id,decoded_token['user_id'])

        if list:
            return {
                'list':list,
                'message': 'List retrieved successfully.',
                'status': 1
            }
        else:
            return{
                'message': 'Empty List.',
                'status': 1
            }
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/delete-list", tags=['List'])
async def delete_list(list_id: int,decoded_token: dict = Depends(decodeJWT)):
    try:
        
        deleted = await delete_list_db(app,list_id,decoded_token['user_id'])

        if deleted:
            return {
                'message': 'List Deleted successfully.',
                'status': 1
            }
        else:
            return{
                'message': 'Error in deleting List.',
                'status': 1
            }
    except Exception as e:
        logging.error(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

