from pydantic import BaseModel, EmailStr

# ---------------- ACTIVITIES ----------------

class ActivityBase(BaseModel):
    name: str
    role: str
    activity: str

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    class Config:
        from_attributes = True


# ---------------- USERS ----------------

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "volunteer"  # Default role

class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True
