from fastapi import FastAPI, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from pathlib import Path

from src.database import get_db, engine, Base
from src import crud, models

# ==========================================
#              CONFIGURACIÓN INICIAL
# ==========================================

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Huancayo Solidario")

# Directorios
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Configurar templates
templates = Jinja2Templates(directory=TEMPLATES_DIR)


# ==========================================
#                 PÁGINAS WEB
# ==========================================

# HOME
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


# LOGIN
@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


# REGISTER PAGE
@app.get("/register-page", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


# SOBRE NOSOTROS
@app.get("/sobremi", response_class=HTMLResponse)
def sobre_mi(request: Request):
    return templates.TemplateResponse("sobreMi.html", {"request": request})


# 🔵 EMPRESAS — ¡YA FUNCIONA CORRECTAMENTE!
@app.get("/empresas", response_class=HTMLResponse)
def empresas(request: Request):
    username = request.cookies.get("username")
    return templates.TemplateResponse("empresas.html", {
        "request": request,
        "username": username
    })


# ORGANIZACIONES
@app.get("/organizaciones", response_class=HTMLResponse)
def organizaciones(request: Request):
    username = request.cookies.get("username")
    return templates.TemplateResponse("organizaciones.html", {
        "request": request,
        "username": username
    })


# PERSONAS
@app.get("/personas", response_class=HTMLResponse)
def personas(request: Request):
    username = request.cookies.get("username")
    return templates.TemplateResponse("personas.html", {
        "request": request,
        "username": username
    })


# PERFIL
@app.get("/profile", response_class=HTMLResponse)
def profile(request: Request):
    username = request.cookies.get("username")

    if not username:
        return RedirectResponse("/login", status_code=303)

    return templates.TemplateResponse("profile.html", {
        "request": request,
        "username": username
    })


# ==========================================
#            REGISTRO DE USUARIO
# ==========================================

@app.post("/register")
def register_user(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Validación de usuario existente
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Usuario ya existe")

    # Validación de email existente
    existing_email = db.query(models.User).filter(models.User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email ya registrado")

    hashed_password = crud.get_password_hash(password)

    # Crear usuario
    db_user = models.User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()

    return RedirectResponse("/login", status_code=303)


# ==========================================
#                    LOGIN
# ==========================================

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


# LOGOUT
@app.get("/logout")
def logout():
    response = RedirectResponse("/", status_code=303)
    response.delete_cookie("username")
    return response


# ==========================================
#            REGISTRO DE ACTIVIDADES
# ==========================================

@app.post("/register_activity")
def register_activity(
    name: str = Form(...),
    role: str = Form(...),
    activity: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        from src import schemas
        db_activity = schemas.ActivityCreate(name=name, role=role, activity=activity)
        new_activity = crud.create_activity(db, db_activity)
        return {"status": "success", "message": "Actividad registrada correctamente"}

    except Exception as e:
        print(f"❌ Error al registrar actividad: {e}")
        raise HTTPException(status_code=500, detail="Error al registrar actividad")


# ==========================================
#             API: LISTADO ACTIVIDADES
# ==========================================

@app.get("/activities")
def get_activities(db: Session = Depends(get_db)):
    return crud.get_all_activities(db)


# ==========================================
#             API: ELIMINAR ACTIVIDAD
# ==========================================

@app.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    crud.delete_activity(db, activity_id)
    return {"message": "deleted"}


# ==========================================
#           RESET PASSWORD (TEST)
# ==========================================

@app.post("/reset-password")
def reset_password(
    username: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.hashed_password = crud.get_password_hash(new_password)
    db.commit()

    return {"message": f"Contraseña de {username} actualizada correctamente"}


# ==========================================
#              DEBUG: LISTA USUARIOS
# ==========================================

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
