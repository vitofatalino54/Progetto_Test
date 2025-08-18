from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
async def health():
    """Simple health check endpoint."""
    return {"status": "ok"}


@app.get("/api/insights/summary")
async def insights_summary():
    """Return fake summary data for now."""
    return {
        "monthly_spending": 1200.0,
        "daily_target": 40.0,
        "savings_forecast": 3000.0,
    }
