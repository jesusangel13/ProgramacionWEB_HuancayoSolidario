from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas

# Configuración para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    # Si la contraseña está en texto plano (usuarios antiguos), hacer comparación directa
    if hashed_password.startswith('$2b$'):
        # Es un hash bcrypt
        return pwd_context.verify(plain_password, hashed_password)
    else:
        # Es texto plano (para compatibilidad con usuarios existentes)
        return plain_password == hashed_password

# Usuarios
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # ✅ SEGURO: Contraseña hasheada para nuevos usuarios
    hashed_password = get_password_hash(user.password)
    
    db_user = models.User(
        username=user.username, 
        hashed_password=hashed_password,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    
    print(f"🔍 Verificando usuario: {username}")
    print(f"📊 Usuario encontrado: {user is not None}")
    
    if user:
        print(f"🔑 Contraseña en BD: {user.hashed_password}")
        
        # ✅ Compatible con texto plano y hash
        if verify_password(password, user.hashed_password):
            print("✅ Login exitoso")
            return user
        else:
            print("❌ Contraseñas no coinciden")
    
    print("❌ Verificación falló")
    return None

# Actividades
def get_all_activities(db: Session):
    activities = db.query(models.Activity).all()
    return [
        {
            "id": act.id,
            "name": act.name,
            "role": act.role,
            "activity": act.activity
        }
        for act in activities
    ]

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