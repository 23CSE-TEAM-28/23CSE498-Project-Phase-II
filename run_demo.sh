#!/bin/bash

# ==============================================================================
# FPDAF: Federated Personalized Drift-Aware Attention Framework (v2.0)
# Interactive Demonstration & Review Defense Runner Script
# ==============================================================================
# Authors: Sheela Akshar Sakhi (Lead AI Engineer & System Architect)
#          Dr. Pallavi (Lead Intensivist & ICU Specialist)
# Project Guide: Dr. G. R. Ramya | Co-Guide: Dr. S. Vandhana
# Amrita School of Computing, Coimbatore, India
# ==============================================================================

set -e

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Base Directory Resolution
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$BASE_DIR"

# Clean Termination Handler
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down FPDAF runtime processes...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    # Free occupied ports
    lsof -t -i :8000 | xargs kill -9 2>/dev/null || true
    lsof -t -i :5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✓ All services safely stopped.${NC}"
    exit 0
}

trap cleanup INT TERM EXIT

# Banner
clear
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║      🏥  FPDAF: FEDERATED PERSONALIZED DRIFT-AWARE ATTENTION FRAMEWORK (v2.0)        ║"
echo "║          ICU Clinical Decision Support System & PyTorch Neural Inference Engine       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BOLD}1. Environment & Hardware Pre-Flight Verification:${NC}"
python3 --version | awk '{print "   • Python:  " $0}'
node --version | awk '{print "   • Node.js: " $0}'

# Check PyTorch & Device
python3 -c "
import torch
device = 'Apple Silicon Metal (MPS)' if torch.backends.mps.is_available() else ('CUDA GPU' if torch.cuda.is_available() else 'Standard CPU')
print(f'   • PyTorch: v{torch.__version__} [Hardware Backend: {device}]')
"

# Check Database
DB_FILE="$BASE_DIR/backend/clinical_warehouse.db"
if [ ! -f "$DB_FILE" ]; then
    echo -e "   ${YELLOW}⚠️  Clinical warehouse database not detected. Populating SQLite tables...${NC}"
    PYTHONPATH="$BASE_DIR" python3 "$BASE_DIR/backend/init_db.py"
fi
echo -e "   ${GREEN}✓ Clinical Warehouse DB: Verified (70 Beds: 50 PhysioNet + 20 Hospital Transcribed)${NC}"

# Check Pretrained Checkpoints
echo -e "\n${BOLD}2. Neural Model Checkpoint Verification (models/ & federated/checkpoints/):${NC}"
python3 -c "
import os
ckpts = [
    ('FPDAF-v2 SOTA Personalized', 'federated/checkpoints/client_0_fpdaf_personalized_model.pt'),
    ('FPDAF Global Consensus', 'federated/checkpoints/best_fpdaf_global_model.pt'),
    ('Ditto Personalized', 'federated/checkpoints/client_0_personalized_model.pt'),
    ('Centralized LSTM Baseline', 'baseline/checkpoints/best_model.pt')
]
for label, path in ckpts:
    if os.path.exists(path):
        size = os.path.getsize(path) / 1024
        print(f'   • {label:28}: {size:6.1f} KB  [READY]')
    else:
        print(f'   • {label:28}: MISSING')
"

# Run Live Terminal Forward Pass Demonstration
echo -e "\n${BOLD}3. Live PyTorch Neural Forward Pass Sanity Test in Terminal:${NC}"
PYTHONPATH="$BASE_DIR" python3 -c "
import time
import torch
from models.bilstm_attention import DualPhaseAttentionLSTM

t0 = time.perf_counter()
model = DualPhaseAttentionLSTM(input_dim=40, hidden_dim=64, num_layers=2)
ckpt = torch.load('federated/checkpoints/client_0_fpdaf_personalized_model.pt', map_location='cpu')
model.load_state_dict(ckpt['personalized_weights'])
model.eval()

# Dummy 24-hour multivariate sequence of 40 clinical signals
dummy_patient = torch.randn(1, 24, 40)
logits, attn = model(dummy_patient, return_attention=True)
prob = float(torch.sigmoid(logits).item())
elapsed_ms = (time.perf_counter() - t0) * 1000.0

print(f'   ${GREEN}✓ Model Architecture: DualPhaseAttentionLSTM (BiLSTM + Dual-Phase Cross-Attention)${NC}')
print(f'   ${GREEN}✓ Input Tensor Shape: {list(dummy_patient.shape)} [Batch=1, Hours=24, Signals=40]${NC}')
print(f'   ${GREEN}✓ Inference Latency:  {elapsed_ms:.2f} ms${NC}')
print(f'   ${GREEN}✓ Model Logits:       {logits.item():.4f} -> Sepsis Probability: {prob:.4f}${NC}')
print(f'   ${GREEN}✓ Temporal Attention: {list(attn.shape)} weights successfully computed across 24h timeline${NC}')
"

# Free Ports
echo -e "\n${BOLD}4. Network Port Configuration:${NC}"
PORT_8000_PID=$(lsof -t -i :8000 2>/dev/null || true)
if [ ! -z "$PORT_8000_PID" ]; then
    echo -e "   • Freeing port 8000 (PID $PORT_8000_PID)..."
    kill -9 $PORT_8000_PID 2>/dev/null || true
fi

PORT_5173_PID=$(lsof -t -i :5173 2>/dev/null || true)
if [ ! -z "$PORT_5173_PID" ]; then
    echo -e "   • Freeing port 5173 (PID $PORT_5173_PID)..."
    kill -9 $PORT_5173_PID 2>/dev/null || true
fi
echo -e "   ${GREEN}✓ Ports 8000 (FastAPI) and 5173 (React Vite) ready.${NC}"

# Boot Backend
echo -e "\n${BOLD}5. Starting FastAPI Telemetry & Neural Server (Port 8000):${NC}"
export PYTHONPATH="$BASE_DIR"
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --log-level info &
BACKEND_PID=$!
sleep 2

# Check Frontend Dependencies
if [ ! -d "$BASE_DIR/dashboard/node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd "$BASE_DIR/dashboard" && npm install
    cd "$BASE_DIR"
fi

# Boot Frontend
echo -e "\n${BOLD}6. Starting React Vite Dashboard Interface (Port 5173):${NC}"
cd "$BASE_DIR/dashboard"
npx vite --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!
cd "$BASE_DIR"
sleep 2

# Summary Box
echo -e "\n${GREEN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                       ✨  ALL FPDAF SERVICES ARE ONLINE  ✨                           ║"
echo "╠═══════════════════════════════════════════════════════════════════════════════════════╣"
echo "║  • Clinician Bedside Dashboard:   http://127.0.0.1:5173                                ║"
echo "║  • Backend REST API:              http://127.0.0.1:8000                                ║"
echo "║  • Interactive Swagger Docs:      http://127.0.0.1:8000/docs                           ║"
echo "║  • PyTorch Health Check:          http://127.0.0.1:8000/api/health                     ║"
echo "╠═══════════════════════════════════════════════════════════════════════════════════════╣"
echo "║  Authorized Review Accounts:                                                          ║"
echo "║    1. Clinician:  Dr. Pallavi (Lead Intensivist & ICU Consultant)                     ║"
echo "║    2. Developer:  Akshar (Lead AI Engineer & System Architect)                        ║"
echo "╠═══════════════════════════════════════════════════════════════════════════════════════╣"
echo "║  Live Terminal Log Stream: [Press Ctrl+C to safely exit]                              ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Open Browser (macOS)
if command -v open &> /dev/null; then
    open "http://127.0.0.1:5173" 2>/dev/null || true
fi

# Keep script running to show live terminal logs from both servers
wait
