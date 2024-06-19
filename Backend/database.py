import asyncpg
from dotenv import load_dotenv,find_dotenv
import os
import logging
from asyncpg import UniqueViolationError
from fastapi import HTTPException
from utility import verify_password, decrypt_password, encrypt_password
from asyncpg.exceptions import UniqueViolationError, PostgresError
from auth_handler import *


# Configure logging
logging.basicConfig(filename='error.log', level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s- %(lineno)d')

# Load environment variables
load_dotenv(find_dotenv())

# Database Connection
async def get_connection():
    return await asyncpg.create_pool(os.environ['DATABASE_URL'])
 
# Event Handlers

async def startup(app):
    app.state.db_pool = await get_connection()

async def shutdown(app):
    await app.state.db_pool.close()

# Re-usable Exception Handling
async def handle_database_exception(e: Exception):
    if isinstance(e, UniqueViolationError):
        error_message = "Email already exists!"
    elif isinstance(e, PostgresError):
        error_message = f"Database Error: {str(e)}"
    elif isinstance(e, IndexError):
        error_message = f"Index Error: {str(e)}"
    elif isinstance(e, ValueError):
        error_message = str(e)
    else:
        error_message = str(e)
    logging.error(error_message)
    error_detail = error_message.split(": ", 1)[-1]
    raise HTTPException(status_code=500, detail=error_detail)

# Query Execution Block
async def execute_query(db_pool, query,*args,fetch_val=False):
    try:
        if fetch_val:
            async with db_pool.acquire() as connection:
                    result = await connection.fetchval(query, *args)
                    return result
        else:
            if query.strip().startswith("SELECT"):
                # Execute SELECT query
                async with db_pool.acquire() as connection:
                    result = await connection.fetch(query, *args)
                    result =  [dict(row) for row in result]
                    return result
            else:
                #Execute INSERT, UPDATE, or DELETE query
                async with db_pool.acquire() as connection:
                    result = await connection.execute(query, *args)
                    affected_rows = result.split(" ")[-1]  # Get the affected row count from the result
                    if int(affected_rows) == 0:
                        raise ValueError("ID does not exist")  # Raise an error if no rows were updated
                    return result
    except Exception as e:
        await handle_database_exception(e)

async def execute_transaction(connection,query,*args,fetch_val=False,fetch_row=False):
    try:
        if fetch_val:
                result = await connection.fetchval(query, *args)
                return result
        elif fetch_row:
            result = await connection.fetchrow(query, *args)
            return result

        else:
            if query.strip().startswith("SELECT"):
                result = await connection.fetch(query, *args)
                result =  [dict(row) for row in result]
                if not result:  # Check if no rows were returned
                        raise ValueError("ID does not exist")  # Raise an error if no rows were returned
                return result
            else:
                # Execute INSERT, UPDATE, or DELETE query
                result = await connection.execute(query, *args)
                affected_rows = result.split(" ")[-1]  # Get the affected row count from the result
                if int(affected_rows) == 0:
                    return affected_rows
                return result
    except Exception as e:
        await handle_database_exception(e)

# Admin Registration      
async def register_user_db(app,user_data, OTP):
    
    user_query = '''
    INSERT INTO users(user_name, user_email, password, phone, otp, created_at) 
    VALUES ($1, $2, $3, $4, $5, now()) RETURNING id
    '''
   
    try:
        async with app.state.db_pool.acquire() as connection:
            async with connection.transaction():

                inserted_user_id = await connection.fetchval(user_query, user_data.user_name,user_data.user_email,user_data.password,user_data.phone,OTP)

                # Iterate over the list of dictionaries in user_rights
            return True
    
    except Exception as e:
        await handle_database_exception(e)

async def verify_otp_db(app,user_email,otp):
    query = '''
            SELECT otp from users where user_email = $1
            '''
    try:
        result = await execute_query(app.state.db_pool,query,user_email)
        db_otp = result[0]['otp']
        return otp==db_otp
    except Exception as e:
        await handle_database_exception(e)

async def activate_user(app,email):
    try:
        update_query = """
                    UPDATE users
                    SET is_verified = $1
                    WHERE user_email = $2
                    RETURNING id
                    """
              
        if email:  # Check if email is not None
            is_verified = True
            is_active = True
            user_id = await execute_query(app.state.db_pool,update_query,is_verified,email,fetch_val=True)

            return user_id
        else:
            raise ValueError("Email cannot be None")
        
    except Exception as e:
        await handle_database_exception(e)


#After Email Verification add Admin to User Table    
async def update_admin_add_to_user(app,email,is_verified=True):
    try:
        async with app.state.db_pool.acquire() as connection:
            async with connection.transaction():
                update_query = """
                    UPDATE 
                    SET is_verified = $1
                    WHERE email = $2
                    RETURNING id
                    """
              
                if email:  # Check if email is not None
                    admin_id = await connection.fetchval(update_query, is_verified, email)
                else:
                     raise ValueError("Email cannot be None")
        

                # Insert data into the User table with the retrieved Customer ID
                insert_query = '''
                        INSERT INTO users (first_name, last_name, email,password,is_superuser,is_active,admin_id)
                        SELECT first_name, last_name, email,password,True,True,$1
                        FROM admins
                        WHERE id = $1 RETURNING id
                        '''
                
                user_id = await connection.fetchval(insert_query,admin_id)
                return user_id
    except Exception as e:
        await handle_database_exception(e)

async def user_exists_db(app,Email):
    try:
        async with app.state.db_pool.acquire() as connection:

            #USER TABLE
            count_query = '''
            SELECT COUNT(*) FROM users WHERE user_email = $1 and is_verified = true
            '''
            u_active_count = await connection.fetchval(count_query, Email)

            count_query = '''
            SELECT COUNT(*) FROM users WHERE user_email = $1 and is_verified = true
            '''
            u_inactive_count = await connection.fetchval(count_query, Email)

            user_count = [u_active_count > 0, u_inactive_count>0]
            
            return user_count
        
    except Exception as e:
        await handle_database_exception(e)

async def verify_credentials_db(app,user_data):

    query = '''
            SELECT id as user_id,password, is_active,user_name,user_email FROM users WHERE user_email = $1 and is_verified = true
        '''
    try:
        
        user_info = await execute_query(app.state.db_pool,query,user_data.user_email)
        # print(user_info)
        if user_info:
            encrypted_password = user_info[0]['password']

            decrypted_pwd = decrypt_password(encrypted_password)

            if user_data.password == decrypted_pwd:
                is_login_verified = True
            else:
                is_login_verified = False

            if is_login_verified:
                    return user_info
            else:
                #  raise HTTPException(status_code=500, detail="Wrong Password!")
                raise ValueError("Wrong Password!")
        else:
            raise HTTPException(status_code=500, detail="Email don't exist!")

    except Exception as e:
        await handle_database_exception(e)

async def fetch_user_details_otp(app,user_email):
    try:
        # Write your logic here
        query = '''
            SELECT id as user_id,password,is_active,user_name,user_email FROM users WHERE user_email = $1
        '''

        user_info = await execute_query(app.state.db_pool,query,user_email)
        return user_info
    except Exception as e:
        await handle_database_exception(e)


async def set_otp_db(app,email,OTP):
    try:
        # Write your logic here
        update_otp = '''
        UPDATE users SET otp=$1 where email=$2 RETURNING first_name;
        '''

        first_name = await execute_query(
            app.state.db_pool,
            update_otp,
            OTP,
            email
        )
        return first_name
    except Exception as e:
        await handle_database_exception(e)


async def fetch_rights(app, user_id):
    try:
        rights_query = '''
        SELECT page_id, "create", read,update,delete FROM user_rights where user_id = $1
        '''

        result = await execute_query(app.state.db_pool,rights_query,user_id)
        
        return result
    
    except Exception as e:
        await handle_database_exception(e)

async def register_pwd_db(app, user_data,is_active = True):

    update_pwd = '''
    UPDATE users SET password=$1, is_active=$2 WHERE user_email = $3 RETURNING id;
    '''
    try:
        async with app.state.db_pool.acquire() as connection:
            async with connection.transaction():
                user_id = await connection.fetchval(update_pwd,user_data.password,is_active, user_data.user_email)

                if user_id:
                    # user_rights = await fetch_rights(app,user_id=user_id)

                    query = '''
                    SELECT user_email,id as user_id,is_active, user_name FROM users WHERE id = $1 
                    '''
                    user_info = await connection.fetch(query, user_id)
                    # user_info = await connection.execute(query,user_id)
                   
                else:
                    raise ValueError("Please provide the USER ID")

        return user_info

    except Exception as e:
        await handle_database_exception(e)

async def edit_user_db(app,user_data,user_id):
    try:
        update_user = '''
        UPDATE users
        SET user_name=$1,phone=$2 WHERE id=$3;
        '''
        async with app.state.db_pool.acquire() as connection:
            async with connection.transaction():
                if user_id:
                    result = await connection.fetchval(update_user,user_data.user_name,user_data.phone,user_id)
                else:
                    raise ValueError("user_id cannot be None")
        return True

    except Exception as e:
        await handle_database_exception(e)

async def list_all_users(app,page_number,page_size,admin_id):
    try:
        count_users = '''SELECT count(*) from users where admin_id=$1 and is_superuser = false and is_deleted = false'''

        total_users = await execute_query(app.state.db_pool,count_users,admin_id)
        total_users = total_users[0]['count']

        # list_query = '''
        # SELECT ROW_NUMBER() OVER (ORDER BY id) AS sr_no,id as user_id,email,first_name,last_name,phone,company,role_id,TO_CHAR(created_at::timestamp, 'DD-MM-YYYY') AS joining_date,password,is_active from users where is_superuser=false and admin_id=$3 and is_deleted = false order by id ASC LIMIT $1 OFFSET ($2 - 1) * $1
        # '''

        list_query = '''
            SELECT 
                ROW_NUMBER() OVER (ORDER BY u.id) AS sr_no,
                u.id AS user_id,
                u.email,
                u.first_name,
                u.last_name,
                u.phone,
                u.company,
                u.role_id,
                r.role_name,
                TO_CHAR(u.created_at::timestamp, 'DD-MM-YYYY') AS joining_date,
                u.password,
                u.is_active 
            FROM 
                users u
            JOIN 
                role_master r ON u.role_id = r.id
            WHERE 
                u.is_superuser = false 
                AND u.admin_id = $3 
                AND u.is_deleted = false 
            ORDER BY u.id ASC LIMIT $1 OFFSET ($2 - 1) * $1;
            '''

        result = await execute_query(app.state.db_pool,list_query,page_size,page_number,admin_id)

        for i in range(0,len(result)):

            encrypted_pass = result[i]['password']
            if encrypted_pass is not None:
                decrypted_password = decrypt_password(encrypted_pass)
                result[i]['password'] = decrypted_password
    
        return total_users,result
    
    except Exception as e:
        await handle_database_exception(e)

async def view_user_details(app,user_id):
    try:
        get_user_details = '''
        SELECT id as user_id,user_email,user_name, phone from users where id=$1
        '''

        user_details = await execute_query(app.state.db_pool,get_user_details,user_id)
    
        return user_details[0]
        
    except Exception as e:
        await handle_database_exception(e)
      
async def delete_user(app,user_id):
    try:
        if user_id:

            # query = '''
            # delete from users
            # WHERE id=$1;
            # '''
            query = '''
            UPDATE users set is_deleted = true
            WHERE id=$1;
            '''

            await execute_query(app.state.db_pool,query,user_id)
            return True
        else:
            raise ValueError('Please Provide User ID')
    except Exception as e:
        await handle_database_exception(e)
    
async def verify_old_pwd(app,user_id,old_password):
    try:
        query = '''
        SELECT password from users where is_active=true and id=$1
        '''

        result = await execute_query(app.state.db_pool,query,user_id)
        encrypted_password_db = result[0]['password']
        decrypted_pwd_db = decrypt_password(encrypted_password_db)

        if old_password == decrypted_pwd_db:
            is_verified = True
        else:
            is_verified = False

        return is_verified
    except Exception as e:
        await handle_database_exception(e)

async def fetch_username_from_email(app,email):
    try:
        # Write your logic here
        query = '''
        SELECT first_name from users where email = $1
        '''

        result = await execute_query(
            app.state.db_pool,
            query,
            email
        )

        first_name = result[0]['first_name']

        return first_name
        ...
    except Exception as e:
        await handle_database_exception(e)

    
async def set_new_pwd(app,user_id,new_password):
    try:
        query = '''
        UPDATE users
        set password=$1
        WHERE id=$2;
        '''

        await execute_query(app.state.db_pool,query,new_password,user_id)

        return True
    except Exception as e:
        await handle_database_exception(e)

async def reset_pwd_db(app,email,new_password):
    try:
        # Write your logic here
        query = '''
        UPDATE users
        set password=$1
        WHERE email=$2;
        '''

        await execute_query(
            app.state.db_pool,
            query,
            new_password,
            email)

        return True
        ...
    except Exception as e:
        await handle_database_exception(e)


#lists
    
async def insert_list_db(app,lists,user_id):
    try:
        insert_query = '''
        INSERT INTO public.lists(name, description, status,user_id)
        VALUES ($1, $2, $3, $4);
        '''
        result = await execute_query(app.state.db_pool,insert_query,lists.name,lists.description,lists.status,user_id)

        return result
    except Exception as e:
        await handle_database_exception(e)
    
async def update_list_db(app,lists,list_id,user_id):
    try:
        update_query = '''
        UPDATE public.lists SET name=$1, description=$2, modified_at= NOW(), status=$3
	    WHERE id = $4;
        '''
        result = await execute_query(app.state.db_pool,update_query,lists.name,lists.description,lists.status,list_id)

        return result
    except Exception as e:
        await handle_database_exception(e)
    
async def get_lists_db(app, user_id, page, page_size):
    try:
        # Calculate offset
        offset = (page - 1) * page_size

        # Query to get paginated lists
        get_lists_query = '''
        SELECT * FROM public.lists where user_id = $1
        LIMIT $2 OFFSET $3;
        '''

        # Query to get the total count of lists
        get_count_query = '''
        SELECT COUNT(*) FROM public.lists where user_id = $1;
        '''

        # Execute both queries
        lists = await execute_query(app.state.db_pool, get_lists_query,user_id,page_size,offset)
        total_count = await execute_query(app.state.db_pool, get_count_query,user_id)
        
        # The total count query returns a list of tuples, extract the count
        total_count = total_count[0]['count']

        # Return lists along with the total count
        return lists, total_count
    except Exception as e:
        await handle_database_exception(e)
    
async def export_lists_db(app, user_id):
    try:
        # Query to get paginated lists
        export_lists_query = '''
        SELECT * FROM public.lists where user_id = $1;
        '''
        lists = await execute_query(app.state.db_pool, export_lists_query,user_id)

        # Return lists along with the total count
        return lists
    except Exception as e:
        await handle_database_exception(e)

async def get_list_by_id_db(app,list_id,user_id):
    try:
        get_list_query = '''
        SELECT * FROM public.lists where id = $1;
        '''
        list = await execute_query(app.state.db_pool,get_list_query,list_id)

        return list[0]
    except Exception as e:
        await handle_database_exception(e)
    
async def delete_list_db(app,list_id,user_id):
    try:
        get_list_query = '''
        DELETE FROM public.lists where id = $1;
        '''
        deleted = await execute_query(app.state.db_pool,get_list_query,list_id)

        return deleted
    except Exception as e:
        await handle_database_exception(e)
