from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import asyncio
import httpx # Changed from requests
from dotenv import load_dotenv
import traceback

# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    # raise ValueError("GEMINI_API_KEY not set")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Placeholder for actual RAG logic and dependencies
# (Vector DB, embedding models, document loaders etc. still needed for full RAG)

app = FastAPI(
    title="MAX AI RAG Backend",
    description="API endpoints for the Retrieval-Augmented Generation backend of MAX AI.",
    version="0.2.1" # Version updated for httpx
)

# --- Data Models ---
class QueryRequest(BaseModel):
    query: str
    history: list[str] = []

class QueryResponse(BaseModel):
    response: str
    sources: list[str] = []

class IndexResponse(BaseModel):
    message: str
    filename: str
    doc_id: str

# --- Placeholder Functions (Indexing still simulated) ---

async def process_and_index_document(file: UploadFile) -> str:
    """Placeholder function to simulate document processing and indexing."""
    print(f"Received file: {file.filename}, Content-Type: {file.content_type}")
    await asyncio.sleep(1)
    print(f"Simulated indexing complete for: {file.filename}")
    return f"doc_{file.filename}_{hash(file.filename)}"

# --- Real Gemini API Call Function (using httpx) ---

async def generate_gemini_response_httpx(query: str, history: list[str]) -> tuple[str, list[str]]:
    """Generates response using Google Gemini API with httpx (async)."""
    print(f"Received query for Gemini (httpx): {query}")
    print(f"Chat history: {history}")

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="API Key for Gemini not configured.")

    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    params = {
        'key': GEMINI_API_KEY,
    }
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": query
                    }
                ]
            }
        ]
    }

    try:
        # Using httpx async client
        async with httpx.AsyncClient() as client:
            response = await client.post(GEMINI_API_URL, params=params, headers=headers, json=payload)
            response.raise_for_status() # Raise HTTPStatusError for bad responses (4xx or 5xx)

        response_data = response.json()

        # --- Safely extract text from response (same logic as before) ---
        if 'candidates' in response_data and isinstance(response_data['candidates'], list) and len(response_data['candidates']) > 0:
            candidate = response_data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content'] and isinstance(candidate['content']['parts'], list) and len(candidate['content']['parts']) > 0:
                if 'text' in candidate['content']['parts'][0]:
                    generated_text = candidate['content']['parts'][0]['text']
                    print("Successfully extracted text from Gemini response (httpx).")
                else:
                    generated_text = "Error: 'text' field not found in response part."
                    print(f"Warning: 'text' field missing. Response part: {candidate['content']['parts'][0]}")
            else:
                generated_text = "Error: 'content' or 'parts' structure incorrect in response."
                print(f"Warning: Unexpected content/parts structure. Candidate: {candidate}")
        elif 'error' in response_data:
             error_details = response_data.get('error', {})
             error_message = error_details.get('message', 'Unknown API error')
             generated_text = f"API Error: {error_message}"
             print(f"API Error received: {error_message}")
        else:
            generated_text = "Error: Unexpected response format from API."
            print(f"Warning: Unexpected API response format. Data: {response_data}")
        # --- End of safe extraction ---

        simulated_sources = ["source_from_gemini_call_httpx (simulated)"]
        print(f"Gemini response generated (httpx).")
        return generated_text, simulated_sources

    except httpx.HTTPStatusError as e:
        print(f"HTTP error calling Gemini API (httpx): {e.response.status_code} - {e.response.text}")
        traceback.print_exc()
        # Propagate the status code if possible
        raise HTTPException(status_code=e.response.status_code, detail=f"Service Error: Gemini API returned {e.response.status_code}. {e.response.text}")
    except httpx.RequestError as e:
        print(f"Request error calling Gemini API (httpx): {e}")
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"Service Unavailable: Error connecting to Gemini API (httpx). {str(e)}")
    except Exception as e:
        print(f"An unexpected error occurred during Gemini API call (httpx): {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# --- API Endpoints ---

@app.post("/index", response_model=IndexResponse)
async def index_document_endpoint(file: UploadFile = File(...)):
    """Receives a document, processes it, and indexes it for RAG (simulation)."""
    try:
        doc_id = await process_and_index_document(file)
        return IndexResponse(
            message="Document indexed successfully (simulation).",
            filename=file.filename,
            doc_id=doc_id
        )
    except Exception as e:
        print(f"Error indexing document: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to index document: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    """Receives a user query, performs RAG (using real Gemini via httpx), and returns a response."""
    try:
        # Call the async httpx function directly
        response_text, sources = await generate_gemini_response_httpx(request.query, request.history)
        return QueryResponse(response=response_text, sources=sources)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error processing query in endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

@app.get("/")
async def read_root():
    """Root endpoint for health check."""
    return {"message": "MAX AI RAG Backend is running."}

# --- Main Execution ---
if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting MAX AI RAG Backend (v0.2.1 with Gemini/httpx) on {host}:{port}")
    uvicorn.run(app, host=host, port=port)

