from fastapi import FastAPI, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pathlib import Path
from src.database import engine, Base, get_db
from src import crud, schemas
from . import models

models.Base.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Huancayo_Solidario")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

# Archivos estáticos y templates
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


# ---------- PÁGINAS ----------

@app.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get("username")  # Leer cookie
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


# ---------- REGISTRO DE USUARIO ----------

@app.post("/register")
def register_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    
    user = schemas.UserCreate(username=username, password=password)
    crud.create_user(db, user)
    return RedirectResponse("/login", status_code=303)


# ---------- LOGIN ----------

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


# ---------- LOGOUT ----------

@app.get("/logout")
def logout():
    response = RedirectResponse("/", status_code=303)
    response.delete_cookie("username")
    return response


# ---------- FORMULARIO DE ACTIVIDADES ----------

@app.post("/register_activity")
def register_activity(
    request: Request,
    name: str = Form(...),
    role: str = Form(...),
    activity: str = Form(...),
    db: Session = Depends(get_db)
):
    db_activity = schemas.ActivityCreate(name=name, role=role, activity=activity)
    crud.create_activity(db, db_activity)
    return RedirectResponse("/", status_code=303)


# ---------- ELIMINAR ACTIVIDAD ----------

@app.get("/delete/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    crud.delete_activity(db, activity_id)
    return RedirectResponse("/", status_code=303)
