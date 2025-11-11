from sqlalchemy.orm import Session
from src import models, schemas

# Usuarios
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if user and user.password == password:
        return user
    return None

# Actividades
def get_all_activities(db: Session):
    return db.query(models.Activity).all()

def create_activity(db: Session, activity: schemas.ActivityCreate):
    db_activity = models.Activity(
        name=activity.name,
        role=activity.role,
        activity=activity.activity
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def delete_activity(db: Session, activity_id: int):
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if activity:
        db.delete(activity)
        db.commit()
