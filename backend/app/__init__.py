"""App package with shared contract access."""

from __future__ import annotations

import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
if str(_REPO_ROOT) not in sys.path:
    # Allow `import shared.*` from anywhere inside the backend package.
    sys.path.append(str(_REPO_ROOT))

__all__ = []

