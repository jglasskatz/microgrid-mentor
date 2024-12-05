from pydantic import BaseModel
from typing import List, Dict, Union
from datetime import datetime

class ComponentBase(BaseModel):
    id: str
    type: str
    x: float
    y: float
    connections: List[str]
    specs: Dict[str, Union[float, str]]

class DesignBase(BaseModel):
    name: str
    components: List[ComponentBase]

class DesignCreate(DesignBase):
    pass

class Design(DesignBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True
