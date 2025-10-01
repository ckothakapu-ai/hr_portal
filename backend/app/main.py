from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.database import engine
from .auth import models as auth_models, router as auth_router
from .candidate_services import models as candidate_models, router as candidate_router
from .hr_services import router as hr_router

auth_models.Base.metadata.create_all(bind=engine)
candidate_models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router.router)
app.include_router(candidate_router.router, prefix="/candidate", tags=["candidate"])
app.include_router(hr_router.router, prefix="/hr", tags=["hr"])

@app.get("/")
def read_root():
    return {"Hello": "World"}