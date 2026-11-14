"""
Federated Server Module Proxy
=============================
Realized in federated/server.py.
Points directly to federated.server.server.FederatedServer.
Handles split-weight aggregation, FedAvg consensus, and wire communication efficiency.
"""

from .server.server import (
    FederatedServer,
    compute_state_dict_bytes,
    logger
)

__all__ = [
    "FederatedServer",
    "compute_state_dict_bytes",
    "logger"
]
