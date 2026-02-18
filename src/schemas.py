from pydantic import BaseModel
from typing import Optional

# Esquema para crear usuario (DEBE incluir email)
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Esquema para respuesta de usuario
class User(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str] = "voluntario"
    
    class Config:
        from_attributes = True

# Esquema para actividades
class ActivityBase(BaseModel):
    name: str
    role: str
    activity: str

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    
    class Config:
        from_attributes = True