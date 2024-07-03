from pydantic import BaseModel, EmailStr, Field, constr, field_validator, validator
from typing import List,Optional, Union
from datetime import date
from fastapi import UploadFile

class UserRegisteration(BaseModel):
    user_name: str
    user_email: EmailStr
    phone: str
    is_active:Optional[bool] = False
    password: str
    confirm_password : str

class UserProfileEdit(BaseModel):
    user_name: str
    # user_email: EmailStr
    phone: str
    # is_active:Optional[bool] = False
    # password: str
    # confirm_password : str

class OTPVerification(BaseModel):
    email: EmailStr
    otp: str

class UserLogin(BaseModel):
    user_email:EmailStr
    password: str

    @validator("password")
    def validate_password(cls, value):
        if not value.strip():  # Check if the password is empty or contains only whitespace
            raise ValueError("Password cannot be empty")
        return value.strip()  # Remove leading and trailing whitespace
    
class ChangePWD(BaseModel):
    otp : str = None
    email: EmailStr = None
    # old_password: str
    new_password: str
    @field_validator("new_password")
    def validate_password(cls, value):
        if not value.strip():  # Check if the password is empty or contains only whitespace
            raise ValueError("Password cannot be empty")
        return value.strip()  # Remove leading and trailing whitespace

class ForgotPWD(BaseModel):
    email:EmailStr

class VerifyOTP(BaseModel):
    user_email:EmailStr
    otp: str

class Lists(BaseModel):
    name: str
    status: str
    description: str
