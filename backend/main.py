import os
import sqlite3
import uuid
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class NoteCreate(BaseModel):
    author: str
    role: str
    content: str
    category: str = "Observation"

app = FastAPI(
    title="FPDAF Clinical Warehouse CDSS API",
    description="Backend clinical data warehouse powering the FPDAF ICU Bedside Workstation",
    version="2.0.0"
)

# Standard-compliant CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "clinical_warehouse.db")

def ensure_db_exists():
    if not os.path.exists(DB_PATH):
        try:
            from backend.init_db import init_database
            init_database()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

def get_db_connection():
    ensure_db_exists()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ----------------- SYSTEM & HEALTH ENDPOINTS -----------------

@app.get("/")
def root():
    return {
        "system": "FPDAF Clinical Decision Support System API",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    ensure_db_exists()
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM patients")
        patient_count = cursor.fetchone()[0]
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "patients_loaded": patient_count,
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# ----------------- API ENDPOINTS -----------------

@app.get("/api/patients")
def get_patients():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Database file not found. Initialize database first.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Query patients and join with their scores and latest vitals
    query = """
    SELECT p.id, p.age, p.gender, p.hospital, p.ward, p.admitted_at, p.status, p.risk_level, p.confidence,
           pr.centralized, pr.fedavg, pr.fedprox, pr.ditto, pr.fpdaf, pr.fpdaf_v2,
           v.heart_rate, v.spo2
    FROM patients p
    JOIN predictions pr ON p.id = pr.patient_id
    LEFT JOIN (
        SELECT patient_id, heart_rate, spo2 
        FROM vitals 
        WHERE hour = 24
    ) v ON p.id = v.patient_id
    """
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
        
    patients_list = []
    for r in rows:
        patients_list.append({
          "id": r["id"],
          "age": r["age"],
          "gender": r["gender"],
          "hospital": r["hospital"],
          "ward": r["ward"],
          "admittedAt": r["admitted_at"],
          "status": r["status"],
          "riskLevel": r["risk_level"],
          "latestVitals": {
              "heartRate": r["heart_rate"],
              "spo2": r["spo2"]
          },
          "scores": {
            "centralized": r["centralized"],
            "fedavg": r["fedavg"],
            "fedprox": r["fedprox"],
            "ditto": r["ditto"],
            "fpdaf": r["fpdaf"],
            "fpdaf_v2": r["fpdaf_v2"]
          },
          "confidence": r["confidence"]
        })
        
    conn.close()
    return patients_list

@app.get("/api/patients/{pat_id}/vitals")
def get_vitals(pat_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT hour, heart_rate, blood_pressure, temperature, respiration, spo2
    FROM vitals
    WHERE patient_id = ?
    ORDER BY hour ASC
    """
    cursor.execute(query, (pat_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail=f"Patient {pat_id} vitals not found")
        
    records = []
    for r in rows:
        records.append({
          "hour": r["hour"],
          "heartRate": r["heart_rate"],
          "bloodPressure": r["blood_pressure"],
          "temperature": r["temperature"],
          "respiration": r["respiration"],
          "spo2": r["spo2"]
        })
    return records

@app.get("/api/patients/{pat_id}/attention")
def get_attention(pat_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT hour, attention_score
    FROM attentions
    WHERE patient_id = ?
    ORDER BY hour ASC
    """
    cursor.execute(query, (pat_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail=f"Patient {pat_id} attention score not found")
        
    return [{"hour": r["hour"], "attentionScore": r["attention_score"]} for r in rows]

@app.get("/api/patients/{pat_id}/notes")
def get_clinical_notes(pat_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT id, author, role, timestamp, content, category
    FROM clinical_notes
    WHERE patient_id = ?
    ORDER BY timestamp DESC
    """
    cursor.execute(query, (pat_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return []
        
    return [{
        "id": r["id"],
        "author": r["author"],
        "role": r["role"],
        "timestamp": r["timestamp"],
        "content": r["content"],
        "category": r["category"]
    } for r in rows]

@app.post("/api/patients/{pat_id}/notes")
def create_clinical_note(pat_id: str, note: NoteCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    note_id = f"NOTE-{uuid.uuid4().hex[:6].upper()}"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    
    try:
        cursor.execute(
            """
            INSERT INTO clinical_notes (id, patient_id, author, role, timestamp, content, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (note_id, pat_id, note.author, note.role, timestamp, note.content, note.category)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to insert clinical note: {str(e)}")
        
    conn.close()
    return {
        "id": note_id,
        "patientId": pat_id,
        "author": note.author,
        "role": note.role,
        "timestamp": timestamp,
        "content": note.content,
        "category": note.category
    }

@app.get("/api/drift")
def get_drift():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT round, client0, client1, client2 FROM drift_metrics ORDER BY round ASC"
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    
    drift_records = []
    for r in rows:
        drift_records.append({
          "round": r["round"],
          "client0": r["client0"],
          "client1": r["client1"],
          "client2": r["client2"]
        })
    return drift_records

@app.get("/api/comparison")
def get_comparison():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT name, accuracy, precision, recall, f1, auroc, comm_cost, train_time, drift_adapt_time, color
    FROM model_comparison
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    
    formatted = []
    for r in rows:
        formatted.append({
          "name": r["name"],
          "accuracy": r["accuracy"],
          "precision": r["precision"],
          "recall": r["recall"],
          "f1": r["f1"],
          "auroc": r["auroc"],
          "commCost": r["comm_cost"],
          "trainTime": r["train_time"],
          "driftAdaptTime": r["drift_adapt_time"],
          "color": r["color"]
        })
    return formatted

@app.get("/api/ablation")
def get_ablation():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT config_name, accuracy, precision, recall, f1, auroc FROM ablation_metrics"
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    
    formatted = {}
    config_keys = {
        "FPDAF w/o AD-CUSUM Trigger": "fpdaf_no_cusum",
        "FPDAF w/o CUSUM": "fpdaf_no_cusum",
        "FPDAF w/o Temporal Attention": "fpdaf_no_attention",
        "FPDAF w/o Attention": "fpdaf_no_attention",
        "FPDAF w/o Personalization": "fpdaf_no_personalization",
        "FPDAF v1 (Baseline)": "fpdaf_v1",
        "Full FPDAF (Proposed)": "full_fpdaf",
        "FPDAF-v2 (Enhanced DDP-ERP)": "fpdaf_v2"
    }
    
    for r in rows:
        c_name = r["config_name"]
        item = {
          "config_name": c_name,
          "accuracy": r["accuracy"],
          "precision": r["precision"],
          "recall": r["recall"],
          "f1_score": r["f1"],
          "auroc": r["auroc"]
        }
        if c_name in config_keys:
            key = config_keys[c_name]
            formatted[key] = item
            if key == "fpdaf_v1":
                formatted["full_fpdaf"] = item
        # Also store with raw name
        formatted[c_name] = item
    return formatted

@app.get("/api/stats")
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Compute live stats from DB
    cursor.execute("SELECT COUNT(*) FROM patients")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM patients WHERE status = 'Critical'")
    high = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(*) FROM patients p 
        JOIN predictions pr ON p.id = pr.patient_id 
        WHERE pr.fpdaf >= 0.35 AND pr.fpdaf <= 0.65
    """)
    medium = cursor.fetchone()[0]
    
    low = total - high - medium
    conn.close()
    
    return {
      "total_patients": total,
      "high_risk": high,
      "medium_risk": medium,
      "low_risk": low,
      "admissions": [
        { "time": "08:00", "admissions": 3, "discharges": 2 },
        { "time": "10:00", "admissions": 5, "discharges": 4 },
        { "time": "12:00", "admissions": 10, "discharges": 6 },
        { "time": "14:00", "admissions": 8, "discharges": 9 },
        { "time": "16:00", "admissions": 12, "discharges": 7 },
        { "time": "18:00", "admissions": 15, "discharges": 10 },
        { "time": "20:00", "admissions": 9, "discharges": 11 }
      ],
      "trends": [
        { "date": "Jul 10", "sepsisAlerts": 3, "fpdafBypasses": 1 },
        { "date": "Jul 11", "sepsisAlerts": 5, "fpdafBypasses": 2 },
        { "date": "Jul 12", "sepsisAlerts": 4, "fpdafBypasses": 1 },
        { "date": "Jul 13", "sepsisAlerts": 7, "fpdafBypasses": 3 },
        { "date": "Jul 14", "sepsisAlerts": 10, "fpdafBypasses": 4 },
        { "date": "Jul 15", "sepsisAlerts": 8, "fpdafBypasses": 2 },
        { "date": "Jul 16", "sepsisAlerts": 15, "fpdafBypasses": 5 }
      ]
    }
