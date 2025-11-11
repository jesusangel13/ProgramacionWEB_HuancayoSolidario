from pydantic import BaseModel

# Usuario
class UserCreate(BaseModel):
    username: str
    password: str

# Actividad
class ActivityCreate(BaseModel):
    name: str
    role: str
    activity: str
