from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class JobBase(BaseModel):
    title: str
    description: Optional[str] = None

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

class Application(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str

    model_config = ConfigDict(from_attributes=True)

class ApplicationUpdate(BaseModel):
    status: str