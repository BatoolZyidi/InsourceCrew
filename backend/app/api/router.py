from fastapi import APIRouter
from app.api.routes import auth, health
from app.api.routes import employees
from app.api.routes import account

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(employees.router)
api_router.include_router(account.router)
