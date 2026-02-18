from fastapi import FastAPI, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from pathlib import Path

from src.database import get_db, engine, Base
from src import crud, models

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Huancayo_Solidario")

# Configuración de archivos estáticos
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# ---------------------------------------
#               PÁGINAS
# ---------------------------------------

@app.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get("username")
    activities = crud.get_all_activities(db)
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "username": username,
            "activities": activities
        }
    )

@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register-page", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

# ---------------------------------------
#          REGISTRO DE USUARIO
# ---------------------------------------

@app.post("/register")
def register_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Verificar si el usuario ya existe
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    
    # Verificar si el email ya existe
    existing_email = db.query(models.User).filter(models.User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # Crear usuario
    hashed_password = crud.get_password_hash(password)
    
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    
    return RedirectResponse("/login", status_code=303)

# ---------------------------------------
#                 LOGIN
# ---------------------------------------

@app.post("/login")
def login_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = crud.verify_user(db, username, password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    response = RedirectResponse("/", status_code=303)
    response.set_cookie(key="username", value=username)
    return response

# ---------------------------------------
#                LOGOUT
# ---------------------------------------

@app.get("/logout")
def logout():
    response = RedirectResponse("/", status_code=303)
    response.delete_cookie("username")
    return response

# ---------------------------------------
#        REGISTRO DE ACTIVIDADES (CORREGIDO - SIN DUPLICADOS)
# ---------------------------------------

@app.post("/register_activity")
def register_activity(
    name: str = Form(...),
    role: str = Form(...),
    activity: str = Form(...),
    db: Session = Depends(get_db)
):
    print(f"📝 Registrando actividad: {name} como {role} en {activity}")
    
    try:
        from src import schemas
        db_activity = schemas.ActivityCreate(name=name, role=role, activity=activity)
        new_activity = crud.create_activity(db, db_activity)
        
        print(f"✅ Actividad guardada con ID: {new_activity.id}")
        
        # Verificar que realmente se guardó
        all_activities = crud.get_all_activities(db)
        print(f"📊 Total de actividades en BD: {len(all_activities)}")
        
        return {"status": "success", "message": "Actividad registrada correctamente"}
        
    except Exception as e:
        print(f"❌ Error al registrar actividad: {e}")
        raise HTTPException(status_code=500, detail="Error al registrar actividad")

# ---------------------------------------
#       API ACTIVIDADES (GET/DELETE)
# ---------------------------------------

@app.get("/activities")
def get_activities(db: Session = Depends(get_db)):
    return crud.get_all_activities(db)

@app.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    crud.delete_activity(db, activity_id)
    return {"message": "deleted"}

# ---------------------------------------
#       RUTA TEMPORAL PARA RESETEO DE CONTRASEÑAS
# ---------------------------------------

@app.post("/reset-password")
def reset_password(
    username: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Ruta temporal para resetear contraseñas a hash"""
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.hashed_password = crud.get_password_hash(new_password)
    db.commit()
    
    return {"message": f"Contraseña de {username} actualizada a hash"}

# ---------------------------------------
#       RUTA PARA VER USUARIOS (DEBUG)
# ---------------------------------------

@app.get("/debug-users")
def debug_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return {
        "total_users": len(users),
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "hashed_password": user.hashed_password,
                "role": user.role
            }
            for user in users
        ]
    }