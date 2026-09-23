# TLG LINK
> *"Short links. Smart analytics."*

A modern, production-quality, **privacy-first URL Shortening & Analytics platform** built as a software engineering and backend internship portfolio project. TLG LINK provides high-speed link shortening, cryptographic collision-safe slug generation, client-side QR codes, and private per-link analytics with zero user tracking and zero raw IP storage.

---

## Privacy-First Architecture

```
                      +-----------------------------+
                      |       Next.js 14 Client     |
                      |  (React 18, TypeScript,     |
                      |      Tailwind CSS)          |
                      +--------------+--------------+
                                     |
                                     | REST / JSON
                                     v
                      +-----------------------------+
                      |       FastAPI Backend       |
                      | (Pydantic, Uvicorn, Python) |
                      +--------------+--------------+
                                     |
                                     | Calls Interface
                                     v
                      +-----------------------------+
                      |      BaseURLRepository      |
                      |       (Storage ABC)         |
                      +--------------+--------------+
                                     |
                     +---------------+---------------+
                     | (V1)                          | (V2 Ready)
                     v                               v
       +----------------------------+  +----------------------------+
       |   InMemoryURLRepository    |  |    PostgresURLRepository   |
       |  (Dual O(1) Token Indices) |  |  (SQLAlchemy / Asyncpg)    |
       +----------------------------+  +----------------------------+
```

### Privacy & Security Principles

1. **Per-Link Private Analytics Token**:
   - Each shortened link generates a cryptographically random `analytics_token` (`secrets.token_urlsafe(32)`).
   - Only possession of this token grants access to the link's analytics at `/analytics/<token>`.
   - The public short URL (`/{short_code}`) never reveals the token or any metrics.
   - Global link directories and user dashboards are completely eliminated.

2. **Zero Raw IP Storage**:
   - Direct redirects capture only minimal metadata necessary for useful creator insights:
     - `timestamp`
     - User Agent derived `device` (Mobile, Desktop, Tablet)
     - User Agent derived `browser` (Chrome, Safari, Firefox, Edge, Other)
     - User Agent derived `os` (Windows, macOS, Linux, Android, iOS, Other)
     - Sanitized `referrer` domain (query strings and user identifiers stripped)
   - **No raw IP addresses are permanently stored**.
   - No user profiling, no cross-link tracking, and no third-party telemetry.

3. **Zero-SSRF Security**:
   - Strict scheme enforcement permitting only `http://` and `https://`.
   - Dangerous schemes (`javascript:`, `data:`, `file:`, `blob:`, `vbscript:`) are immediately rejected.
   - The server **never fetches** user-submitted target URLs.

4. **Anti-Indexing & Private Caching**:
   - Private analytics endpoints and pages set `Cache-Control: no-store, private` and `X-Robots-Tag: noindex, nofollow` to prevent indexing by web crawlers.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI & Styling**: React 18, Tailwind CSS, Lucide React icons
- **Language**: TypeScript
- **Design Tokens**: Custom dark SaaS palette (`#080B12` background, `#0F1420` surface, `#3B82F6` electric blue, `#06B6D4` cyan accent)
- **QR Generation**: `qrcode.react` (client-side rendering & PNG download)

### Backend
- **Framework**: FastAPI (Python 3.12 / 3.14 compatible)
- **Validation**: Pydantic v2
- **Server**: Uvicorn
- **Testing**: Pytest, HTTPX

---

## REST API Specification

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/urls` | Create short link & generate private analytics token | `201 Created` |
| `GET` | `/api/v1/urls/{code}` | Retrieve public link metadata (does NOT leak token) | `200 OK` |
| `GET` | `/api/v1/analytics/{token}` | Retrieve private click analytics & breakdowns | `200 OK` |
| `DELETE` | `/api/v1/analytics/{token}` | Delete short link & its click data using token | `200 OK` |
| `GET` | `/{short_code}` | Increment click and redirect to original URL | `307 Temporary Redirect` |
| `GET` | `/health` | Health check endpoint | `200 OK` |

### Example Request & Response

#### Create Short URL
```bash
curl -X POST http://localhost:8000/api/v1/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/fastapi/fastapi"}'
```

```json
{
  "short_code": "k8Xp92a",
  "short_url": "http://localhost:8000/k8Xp92a",
  "original_url": "https://github.com/fastapi/fastapi",
  "created_at": "2026-09-23T18:00:00.000000Z",
  "expires_at": null,
  "click_count": 0,
  "is_expired": false,
  "analytics_url": "http://localhost:3000/analytics/abc123tokenSecret...",
  "analytics_token": "abc123tokenSecret..."
}
```

---

## Local Development Setup

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
pytest -v

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend will be available at:
- API Server: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run TypeScript checks
npm run typecheck

# Build verification
npm run build

# Start Next.js development server
npm run dev
```
Frontend will be available at: `http://localhost:3000`

---

## Future Migration to PostgreSQL (V2)

The codebase has been engineered specifically to make migrating to PostgreSQL seamless.

### Steps to implement PostgreSQL:

1. **Add Dependencies**:
   Add `asyncpg`, `sqlalchemy`, or `psycopg` to `backend/requirements.txt`.

2. **Implement Repository**:
   Create `backend/app/storage/postgres.py` implementing `BaseURLRepository`:
   ```python
   class PostgresURLRepository(BaseURLRepository):
       def __init__(self, session_factory):
           self.session_factory = session_factory
           
       def create(self, item: URLItem) -> URLItem:
           # INSERT INTO urls ...
           ...
           
       def get_by_token(self, token: str) -> Optional[URLItem]:
           # SELECT * FROM urls WHERE analytics_token = :token ...
           ...
   ```

3. **Swap Dependency Injection in `api/deps.py`**:
   ```python
   # Replace:
   # _repository = InMemoryURLRepository()
   # With:
   _repository = PostgresURLRepository(session_factory=...)
   ```

Because `URLService` interacts exclusively with `BaseURLRepository`, zero changes to business logic or API endpoints are required.
