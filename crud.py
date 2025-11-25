from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas

# ========================================
# Configuración para hashing de contraseñas
# ========================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ========================================
# Funciones de contraseña
# ========================================
def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro usando bcrypt.
    🔐 bcrypt soporta máximo 72 bytes, así que truncamos y convertimos a string.
    """
    truncated = password.encode("utf-8")[:72].decode("utf-8", "ignore")
    return pwd_context.hash(truncated)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña contra su hash bcrypt.
    Soporta además contraseñas antiguas en texto plano.
    """
    # ¿Es un hash bcrypt?
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        truncated = plain_password.encode("utf-8")[:72].decode("utf-8", "ignore")
        return pwd_context.verify(truncated, hashed_password)

    # Modo legacy: texto plano en BD
    return plain_password == hashed_password


# ========================================
# Funciones para usuarios
# ========================================
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    """
    Crea un nuevo usuario con contraseña hasheada.
    """
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
    """
    Verifica el login de un usuario.
    """
    user = get_user_by_username(db, username)

    print(f"🔍 Verificando usuario: {username}")
    print(f"📊 Usuario encontrado: {user is not None}")

    if user:
        print(f"🔑 Hash en BD: {user.hashed_password}")
        if verify_password(password, user.hashed_password):
            print("✅ Login exitoso")
            return user
        else:
            print("❌ Contraseña incorrecta")

    print("❌ Verificación falló")
    return None


# ========================================
# Funciones para actividades
# ========================================
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
