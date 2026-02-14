from pydantic import BaseModel, EmailStr

# Base Schema (Shared properties)
class UserBase(BaseModel):
    email: EmailStr
    username: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to return via API (Never return the password!)
class UserOut(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Schema for Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for Token (JWT)
class Token(BaseModel):
    access_token: str
    token_type: str