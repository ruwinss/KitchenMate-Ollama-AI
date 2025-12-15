from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    prompt: str

@app.post("/api/ask")
def ask_custom_model(query: Query):
    result = subprocess.run(
        ["ollama", "run", "kitchenmate", query.prompt],
        capture_output=True,
        text=True
    )

    return {"response": result.stdout}
