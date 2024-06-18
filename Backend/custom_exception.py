from asyncpg import UniqueViolationError
import logging
from fastapi import HTTPException

# Configure logging
logging.basicConfig(filename='error.log', level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s- %(lineno)d')

async def handle_exceptions(coroutine):
    async def wrapper(*args, **kwargs):
        try:
            return await coroutine(*args, **kwargs)
        except UniqueViolationError as e:
            logging.error(f"Email already exists!: {e}")
            # raise HTTPException(status_code=500, detail="Email already exists!")
            raise ValueError("Email already exists!")
    return wrapper