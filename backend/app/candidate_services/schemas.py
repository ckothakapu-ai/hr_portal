from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class DocumentBase(BaseModel):
    file_name: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    candidate_id: int
    status: str

    model_config = ConfigDict(from_attributes=True)

class JobBase(BaseModel):
    title: str
    description: Optional[str] = None

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    owner_id: int
    applications: List[Application] = []

    model_config = ConfigDict(from_attributes=True)

class User(BaseModel):
    id: int
    email: str
    is_hr: bool
    jobs: List[Job] = []
    applications: List[Application] = []
    documents: List[Document] = []

    model_config = ConfigDict(from_attributes=True)