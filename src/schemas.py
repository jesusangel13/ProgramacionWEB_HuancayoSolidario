from pydantic import BaseModel

class ActivityBase(BaseModel):
    name: str
    role: str
    activity: str

class ActivityCreate(ActivityBase):
    pass

class UserBase(BaseModel):
    username: str
    password: str

class UserCreate(UserBase):
    pass
