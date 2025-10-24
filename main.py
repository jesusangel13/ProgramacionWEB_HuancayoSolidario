import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src import models, database, crud, schemas
import hashlib

# Inicializar aplicación
app = FastAPI(title="Huancayo Solidario")

# Conectar carpetas estáticas y plantillas
app.mount("/static", StaticFiles(directory="src/static"), name="static")
templates = Jinja2Templates(directory="src/templates")

# Crear las tablas si no existen
models.Base.metadata.create_all(bind=database.engine)

# --- Hash de contraseñas ---
def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# --- Página principal ---
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    db = database.SessionLocal()
    activities = crud.get_all_activities(db)
    total = len(activities)
    db.close()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "activities": activities,
        "volunteers": total
    })

# --- Registrar actividad ---
@app.post("/register")
async def register(name: str = Form(...), role: str = Form(...), activity: str = Form(...)):
    db = database.SessionLocal()
    crud.create_activity(db, schemas.ActivityCreate(name=name, role=role, activity=activity))
    db.close()
    return RedirectResponse(url="/", status_code=303)

# --- Eliminar actividad ---
@app.get("/delete/{activity_id}")
async def delete_activity(activity_id: int):
    db = database.SessionLocal()
    crud.delete_activity(db, activity_id)
    db.close()
    return RedirectResponse(url="/", status_code=303)

# --- LOGIN / REGISTER PAGE ---
@app.get("/loginregister", response_class=HTMLResponse)
async def loginregister(request: Request):
    return templates.TemplateResponse("loginregister.html", {"request": request})

# --- Iniciar sesión ---
@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    db = database.SessionLocal()
    hashed = hash_password(password)
    user = crud.verify_user(db, username, hashed)
    db.close()
    if user:
        return RedirectResponse(url="/", status_code=303)
    return RedirectResponse(url="/loginregister", status_code=303)

# --- Registrar usuario ---
@app.post("/register_user")
async def register_user(username: str = Form(...), password: str = Form(...)):
    db = database.SessionLocal()
    hashed = hash_password(password)
    crud.create_user(db, schemas.UserCreate(username=username, password=hashed))
    db.close()
    return RedirectResponse(url="/loginregister", status_code=303)
