from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import sqlite3
import datetime

# PostgreSQL driver (optional import if running in minimal environment)
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

app = FastAPI(title="Permpoon Management System API")

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_dir = os.path.join(parent_dir, "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

templates_dir = os.path.join(parent_dir, "templates")
templates = Jinja2Templates(directory=templates_dir)

# --- DATABASE SETUP (Railway PostgreSQL or Local SQLite) ---
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def get_db_connection():
    if DATABASE_URL and HAS_PSYCOPG2:
        return psycopg2.connect(DATABASE_URL)
    else:
        db_path = os.path.join(parent_dir, "permpoon_local.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn

def init_db():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        if DATABASE_URL and HAS_PSYCOPG2:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    code VARCHAR(100) PRIMARY KEY,
                    data JSONB,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    code TEXT PRIMARY KEY,
                    data TEXT,
                    updated_at TEXT
                );
            """)
        conn.commit()
    except Exception as e:
        print(f"Warning: Database init error: {e}")
    finally:
        if conn:
            conn.close()

# Initialize DB on import
init_db()

# --- DEFAULT SEED DATA FOR PERMPOON ---
DEFAULT_PERMPOON_PROJECTS = {
    "PP-2601": {
        "code": "PP-2601",
        "year": 2026,
        "name": "งานปรับปรุงและรีโนเวทอาคารสำนักงานใหญ่ ชั้น 5-8",
        "customer": "อาคารเพิ่มพูน ทาวเวอร์",
        "category": "renovation",
        "categoryLabel": "ปรับปรุง / รีโนเวท",
        "site": "ถนนพระราม 9, ห้วยขวาง, กทม.",
        "siteLocation": "ถนนพระราม 9, ห้วยขวาง, กทม.",
        "manager": "นายเพิ่มพูน ช่างทอง",
        "owner": "บจก. สยาม พัฒนาการ",
        "start": "15/01/2026",
        "end": "30/06/2026",
        "poDate": "10/01/2026",
        "contractValue": 4850000,
        "value": 4850000,
        "cost": 3200000,
        "estimatedCost": 3200000,
        "profit": 1650000,
        "progress": 65,
        "plannedProgress": 70,
        "status": "งานที่กำลังดำเนินการ",
        "description": "งานรื้อถอน ปรับผังห้องประชุม กั้นผนังเบาเก็บเสียง ปูพื้น SPC และงานตกแต่งฝ้าเพดานสถาปัตยกรรม",
        "isSynced": True,
        "updatedAt": datetime.datetime.now().isoformat()
    },
    "PP-2602": {
        "code": "PP-2602",
        "year": 2026,
        "name": "งานปรับปรุงระบบประปา-สุขาภิบาล และเปลี่ยนท่อเมนแนวดิ่ง",
        "customer": "คอนโด แกรนด์พาร์ค อโศก",
        "category": "plumbing",
        "categoryLabel": "ประปาและสุขาภิบาล",
        "site": "สุขุมวิท 21, วัฒนา, กทม.",
        "siteLocation": "สุขุมวิท 21, วัฒนา, กทม.",
        "manager": "นายธีระศักดิ์ วิศวกรงานระบบ",
        "owner": "นิติบุคคลอาคารชุด แกรนด์พาร์ค",
        "start": "01/02/2026",
        "end": "30/05/2026",
        "poDate": "25/01/2026",
        "contractValue": 2650000,
        "value": 2650000,
        "cost": 1900000,
        "estimatedCost": 1900000,
        "profit": 750000,
        "progress": 40,
        "plannedProgress": 45,
        "status": "งานที่กำลังดำเนินการ",
        "description": "เปลี่ยนท่อเหล็กชุบสังกะสีเดิมเป็นท่อ PPR ทนแรงดันสูง พร้อมเปลี่ยน Booster Pump คู่ 2 ชุด",
        "isSynced": True,
        "updatedAt": datetime.datetime.now().isoformat()
    },
    "PP-2603": {
        "code": "PP-2603",
        "year": 2026,
        "name": "งานซ่อมรอยแตกร้าวคอนกรีตและทากันซึมดาดฟ้าคลังสินค้า",
        "customer": "โรงงานไทยอินดัสเตรียล บางพลี",
        "category": "building",
        "categoryLabel": "ซ่อมแซมอาคาร",
        "site": "นิคมอุตสาหกรรมบางพลี, จ.สมุทรปราการ",
        "siteLocation": "นิคมอุตสาหกรรมบางพลี, จ.สมุทรปราการ",
        "manager": "นายธนพล วิศวกรโยธา",
        "owner": "บจก. ไทยอินดัสเตรียล ซัพพลาย",
        "start": "10/01/2026",
        "end": "15/03/2026",
        "poDate": "05/01/2026",
        "contractValue": 1800000,
        "value": 1800000,
        "cost": 1250000,
        "estimatedCost": 1250000,
        "profit": 550000,
        "progress": 100,
        "plannedProgress": 100,
        "status": "งานเสร็จแล้วรอส่งงาน/อนุมัติ",
        "description": "งานกรีดซ่อม Epoxy Injection รอยร้าวเสา-คาน และลงระบบกันซึม Polyurethane ดาดฟ้า 2,400 ตร.ม.",
        "isSynced": True,
        "updatedAt": datetime.datetime.now().isoformat()
    },
    "PP-2604": {
        "code": "PP-2604",
        "year": 2026,
        "name": "งานปรับปรุงภูมิทัศน์และต่อเติมสโมสรหมู่บ้าน",
        "customer": "นิติบุคคลหมู่บ้าน สราญสิริ",
        "category": "general",
        "categoryLabel": "รับเหมาทั่วไป",
        "site": "ถนนราชพฤกษ์, จ.นนทบุรี",
        "siteLocation": "ถนนราชพฤกษ์, จ.นนทบุรี",
        "manager": "ทีมงานวิศวกรรม เพิ่มพูน",
        "owner": "คณะกรรมการนิติบุคคล สราญสิริ",
        "start": "01/04/2026",
        "end": "30/08/2026",
        "poDate": "20/03/2026",
        "contractValue": 3200000,
        "value": 3200000,
        "cost": 2400000,
        "estimatedCost": 2400000,
        "profit": 800000,
        "progress": 0,
        "plannedProgress": 10,
        "status": "งานที่รอเสนอราคา",
        "description": "งานเสนอราคาปรับปรุงอาคารฟิตเนส ขยายสระว่ายน้ำ และจัดทำทางเดินคนพิการรอบสวนส่วนกลาง",
        "isSynced": True,
        "updatedAt": datetime.datetime.now().isoformat()
    },
    "PP-2605": {
        "code": "PP-2605",
        "year": 2026,
        "name": "งานรีโนเวททาวน์โฮม 3 ชั้น และปรับปรุงระบบสุขาภิบาล",
        "customer": "บริษัท นีโอ แอสเสท จำกัด",
        "category": "renovation",
        "categoryLabel": "ปรับปรุง / รีโนเวท",
        "site": "ซอยอารีย์สัมพันธ์ 5, พญาไท, กทม.",
        "siteLocation": "ซอยอารีย์สัมพันธ์ 5, พญาไท, กทม.",
        "manager": "นายพิชัย วิศวกรโครงการ",
        "owner": "ฝ่ายพัฒนาอสังหาริมทรัพย์ บจก. นีโอ แอสเสท",
        "start": "01/10/2025",
        "end": "15/01/2026",
        "poDate": "20/09/2025",
        "contractValue": 1550000,
        "value": 1550000,
        "cost": 1100000,
        "estimatedCost": 1100000,
        "profit": 450000,
        "progress": 100,
        "plannedProgress": 100,
        "status": "งานที่ดำเนินการเสร็จแล้ว",
        "description": "งานปรับปรุงห้องพักอาศัย ปรับปรุงห้องน้ำ และวางแนวท่อสุขาภิบาลใหม่ทั้งหมด",
        "isSynced": True,
        "updatedAt": datetime.datetime.now().isoformat()
    }
}

# --- REST API ENDPOINTS FOR RAILWAY DATABASE ---
class ProjectPayload(BaseModel):
    code: str
    data: Dict[str, Any]

@app.get("/api/projects")
async def get_projects():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT code, data FROM projects")
        rows = cur.fetchall()
        
        projects = {}
        for row in rows:
            code = row[0] if isinstance(row, tuple) else row["code"]
            raw_data = row[1] if isinstance(row, tuple) else row["data"]
            data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
            projects[code] = data
            
        # If DB is empty, seed initial Permpoon projects
        if not projects:
            for code, data in DEFAULT_PERMPOON_PROJECTS.items():
                save_data_str = json.dumps(data) if not (DATABASE_URL and HAS_PSYCOPG2) else data
                if DATABASE_URL and HAS_PSYCOPG2:
                    cur.execute("INSERT INTO projects (code, data) VALUES (%s, %s) ON CONFLICT (code) DO NOTHING", (code, json.dumps(data)))
                else:
                    cur.execute("INSERT OR IGNORE INTO projects (code, data, updated_at) VALUES (?, ?, ?)", (code, json.dumps(data), datetime.datetime.now().isoformat()))
            conn.commit()
            projects = DEFAULT_PERMPOON_PROJECTS
            
        return {"status": "success", "data": projects}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": DEFAULT_PERMPOON_PROJECTS}
    finally:
        if conn:
            conn.close()

@app.post("/api/projects")
async def save_project(payload: ProjectPayload):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        code = payload.code
        data = payload.data
        data["code"] = code
        data["updatedAt"] = datetime.datetime.now().isoformat()
        
        if DATABASE_URL and HAS_PSYCOPG2:
            cur.execute("""
                INSERT INTO projects (code, data, updated_at) 
                VALUES (%s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (code) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;
            """, (code, json.dumps(data)))
        else:
            cur.execute("""
                INSERT OR REPLACE INTO projects (code, data, updated_at)
                VALUES (?, ?, ?);
            """, (code, json.dumps(data), datetime.datetime.now().isoformat()))
        conn.commit()
        return {"status": "success", "code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.delete("/api/projects/{code}")
async def delete_project(code: str):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        if DATABASE_URL and HAS_PSYCOPG2:
            cur.execute("DELETE FROM projects WHERE code = %s", (code,))
        else:
            cur.execute("DELETE FROM projects WHERE code = ?", (code,))
        conn.commit()
        return {"status": "success", "deleted": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# --- TEMPLATE & STATIC ROUTES ---
def render_template(request: Request, name: str):
    try:
        return templates.TemplateResponse(request, name, {"request": request})
    except TypeError:
        return templates.TemplateResponse(name, {"request": request})

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return render_template(request, "index.html")

@app.get("/logo.png")
async def get_logo():
    logo_path = os.path.join(parent_dir, "logo.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.join(static_dir, "logo.png")
    if os.path.exists(logo_path):
        return FileResponse(logo_path, media_type="image/png")
    return HTMLResponse(status_code=404)

@app.get("/logo_icon.png")
async def get_logo_icon():
    icon_path = os.path.join(parent_dir, "logo_icon.png")
    if not os.path.exists(icon_path):
        icon_path = os.path.join(static_dir, "logo_icon.png")
    if os.path.exists(icon_path):
        return FileResponse(icon_path, media_type="image/png")
    return HTMLResponse(status_code=404)

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return render_template(request, "index.html")

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return render_template(request, "index.html")

@app.get("/quoting", response_class=HTMLResponse)
async def quoting_page(request: Request):
    return render_template(request, "index.html")

@app.get("/projects", response_class=HTMLResponse)
async def projects_page(request: Request):
    return render_template(request, "index.html")

@app.get("/cost", response_class=HTMLResponse)
async def cost_page(request: Request):
    return render_template(request, "index.html")

@app.get("/health")
async def health_check():
    db_type = "PostgreSQL (Railway)" if (DATABASE_URL and HAS_PSYCOPG2) else "SQLite (Local/Standalone)"
    return {
        "status": "ok",
        "service": "permpoon-management-system",
        "database": db_type
    }

@app.get("/{full_path:path}", response_class=HTMLResponse)
async def catch_all(request: Request, full_path: str):
    return render_template(request, "index.html")
