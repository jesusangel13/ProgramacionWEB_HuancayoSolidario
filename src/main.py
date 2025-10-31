from fastapi import FastAPI, Request, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import os

print("DB USER:", os.getenv("DB_USER"))

from src.database import SessionLocal, engine
from src import models, crud, schemas

# ✅ Crear tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Huancayo Solidario")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Static y Plantillas
app.mount("/static", StaticFiles(directory="src/static"), name="static")
templates = Jinja2Templates(directory="src/templates")

# ✅ DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




@app.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("loginregister.html", {"request": request, "tab": "login"})


@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("loginregister.html", {"request": request, "tab": "register"})



@app.post("/register")
def register_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Usuario ya existe")

    data = schemas.UserCreate(username=username, password=password)
    crud.create_user(db, data)

    # ✅ Redirigir al login
    return RedirectResponse("/login", status_code=303)


@app.post("/login")
def login_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = crud.verify_user(db, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return RedirectResponse("/", status_code=303)
