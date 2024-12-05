from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import logging
import sys

from . import models, schemas
from .database import engine, get_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Microgrid API", docs_url="/docs", redoc_url="/redoc")

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Microgrid API is running"}

try:
    # Create database tables
    logger.info("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {str(e)}")
    raise

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample product data (we'll move this to a database later)
products = [
    {
        "id": "1",
        "name": "Solar Panel 400W",
        "description": "High-efficiency monocrystalline solar panel",
        "price": 299.99,
        "type": "solar",
        "specs": {"power": 400, "efficiency": 0.21},
    },
    {
        "id": "2",
        "name": "Solar Panel 200W",
        "description": "Mid-range monocrystalline solar panel",
        "price": 159.99,
        "type": "solar",
        "specs": {"power": 200, "efficiency": 0.20},
    },
    {
        "id": "3",
        "name": "Lithium Battery 5kWh",
        "description": "Deep cycle lithium battery for energy storage",
        "price": 3499.99,
        "type": "battery",
        "specs": {"capacity": 5000, "voltage": 48},
    },
    {
        "id": "4",
        "name": "Battery 100Ah",
        "description": "12V deep cycle battery",
        "price": 899.99,
        "type": "battery",
        "specs": {"capacity": 1200, "voltage": 12},
    },
    {
        "id": "5",
        "name": "LED Light Package",
        "description": "Energy-efficient LED lighting system",
        "price": 79.99,
        "type": "load",
        "specs": {"power": 60, "name": "Lights"},
    },
    {
        "id": "6",
        "name": "Energy Star Fridge",
        "description": "Energy-efficient refrigerator",
        "price": 899.99,
        "type": "load",
        "specs": {"power": 500, "name": "Fridge"},
    }
]

@app.post("/api/designs", response_model=schemas.Design)
def create_design(design: schemas.DesignCreate, db: Session = Depends(get_db)):
    db_design = models.Design(**design.dict())
    db.add(db_design)
    db.commit()
    db.refresh(db_design)
    return db_design

@app.get("/api/designs", response_model=List[schemas.Design])
def get_designs(db: Session = Depends(get_db)):
    return db.query(models.Design).order_by(models.Design.created_at.desc()).all()

@app.get("/api/designs/{design_id}", response_model=schemas.Design)
def get_design(design_id: int, db: Session = Depends(get_db)):
    db_design = db.query(models.Design).filter(models.Design.id == design_id).first()
    if db_design is None:
        raise HTTPException(status_code=404, detail="Design not found")
    return db_design

@app.get("/api/products/search")
async def search_products(
    type: str = None,
    power_min: float = None,
    power_max: float = None,
    efficiency_min: float = None,
    efficiency_max: float = None,
    area_min: float = None,
    area_max: float = None,
    capacity_min: float = None,
    capacity_max: float = None,
    voltage_min: float = None,
    voltage_max: float = None,
):
    logger.info(f"Search request - type: {type}, specs: {locals()}")
    filtered_products = products
    
    if type:
        filtered_products = [p for p in filtered_products if p["type"] == type]
        logger.info(f"After type filter: {len(filtered_products)} products")
    
    # Filter by specs ranges if provided
    specs_filters = [
        ('power', power_min, power_max),
        ('efficiency', efficiency_min, efficiency_max),
        ('area', area_min, area_max),
        ('capacity', capacity_min, capacity_max),
        ('voltage', voltage_min, voltage_max),
    ]
    
    for spec_name, min_val, max_val in specs_filters:
        if min_val is not None:
            filtered_products = [
                p for p in filtered_products
                if spec_name in p["specs"] and float(p["specs"][spec_name]) >= min_val
            ]
        if max_val is not None:
            filtered_products = [
                p for p in filtered_products
                if spec_name in p["specs"] and float(p["specs"][spec_name]) <= max_val
            ]
    
    logger.info(f"Final results: {filtered_products}")
    return {"products": filtered_products}

def _check_spec_match(product_specs, key, value):
    if key.endswith('_min'):
        base_key = key[:-4]
        spec_value = float(product_specs.get(base_key, 0))
        return spec_value >= float(value)
    elif key.endswith('_max'):
        base_key = key[:-4]
        spec_value = float(product_specs.get(base_key, 0))
        return spec_value <= float(value)
    return str(product_specs.get(key)) == str(value)

@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    alternatives = [
        p for p in products 
        if p["type"] == product["type"] and p["id"] != product_id
    ]
    
    return {**product, "alternatives": alternatives}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
