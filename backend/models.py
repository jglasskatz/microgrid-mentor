from sqlalchemy import Column, Integer, String, JSON
from .database import Base

class Design(Base):
    __tablename__ = "designs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    components = Column(JSON, nullable=False)
    created_at = Column(String, nullable=False, server_default='NOW()')
