import streamlit as st
import os
import httpx
import asyncio
from dotenv import load_dotenv
import traceback
import tempfile # For handling temporary files

# RAG specific imports
from pypdf import PdfReader # Updated import for pypdf
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# --- Page Configuration (Dark Theme & Layout) ---
st.set_page_config(
    page_title="MAX AI - RAG Enhanced",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS (Keep the existing dark theme CSS) ---
st.markdown("""
<style>
    /* Overall App Styling */
    .stApp {
        background-color: #0f172a; /* Dark blue-gray background */
        color: #e2e8f0; /* Light gray text */
    }
    /* ... (rest of the CSS from previous step) ... */
    /* Main Chat Area */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
        padding-left: 3rem;
        padding-right: 3rem;
    }
    /* Chat Messages */
    .stChatMessage {
        background-color: #1e293b; /* Slightly lighter dark blue */
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
        margin-bottom: 1rem;
        border: 1px solid #334155; /* Subtle border */
    }
    .stChatMessage[data-testid="chatAvatarIcon-user"] svg {
        fill: #60a5fa; /* Blue user icon */
    }
    .stChatMessage[data-testid="chatAvatarIcon-assistant"] svg {
        fill: #34d399; /* Green assistant icon */
    }
    /* Chat Input Area */
    .stChatInputContainer {
        background-color: #1e293b;
        border-top: 1px solid #334155;
        padding: 1rem;
    }
    .stTextInput > div > div > input {
        background-color: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 0.375rem;
    }
    .stButton > button {
        background-color: #2563eb; /* Blue button */
        color: white;
        border: none;
        border-radius: 0.375rem;
    }
    .stButton > button:hover {
        background-color: #1d4ed8;
    }
    /* Sidebar Styling */
    .stSidebar {
        background-color: #1e293b;
        border-right: 1px solid #334155;
    }
    .stSidebar .stButton > button {
        background-color: #475569; /* Gray sidebar button */
        color: #e2e8f0;
    }
     .stSidebar .stButton > button:hover {
        background-color: #64748b;
    }
    /* Title Styling */
    h1 {
        color: #93c5fd; /* Light blue title */
        text-align: center;
        padding-bottom: 1rem;
        border-bottom: 1px dashed #334155;
    }
    /* Hide Streamlit Header/Footer */
    #MainMenu {visibility: hidden;} /* Optional: Hide hamburger menu */
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# --- Load Environment Variables ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# --- RAG Setup --- 
# Initialize Sentence Transformer model (cached by Streamlit)
@st.cache_resource
def load_embedding_model():
    print("Loading embedding model...")
    # Using a smaller, faster model suitable for CPU
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("Embedding model loaded.")
    return model

embedding_model = load_embedding_model()

# Function to extract text from PDF
def extract_text_from_pdf(pdf_file):
    text = ""
    try:
        pdf_reader = PdfReader(pdf_file)
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n" # Add newline between pages
    except Exception as e:
        st.error(f"Error reading PDF: {e}")
        return None
    return text

# Function to split text into chunks (simple splitting for now)
def split_text(text, chunk_size=500, chunk_overlap=50):
    # Basic splitting by paragraphs first, then size
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = ""
    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 < chunk_size:
            current_chunk += para + "\n\n"
        else:
            # If paragraph itself is too large, split it crudely
            if len(para) > chunk_size:
                for i in range(0, len(para), chunk_size - chunk_overlap):
                    chunks.append(para[i:i + chunk_size])
            else:
                 if current_chunk:
                    chunks.append(current_chunk.strip())
                 current_chunk = para + "\n\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    # Further refine chunking if needed, e.g., using RecursiveCharacterTextSplitter
    # For simplicity now, we use the basic paragraph/size split
    print(f"Split text into {len(chunks)} chunks.")
    return chunks

# Function to create FAISS index
# REMOVED @st.cache_resource as it caused hashing errors with dynamic chunks/model
def create_faiss_index(text_chunks, model):
    if not text_chunks:
        return None, None
    try:
        print("Creating embeddings...")
        embeddings = model.encode(text_chunks, convert_to_tensor=False)
        # Ensure embeddings are float32, FAISS requirement
        embeddings = np.array(embeddings).astype("float32") 
        print(f"Embeddings created with shape: {embeddings.shape}")
        
        # Create FAISS index
        index = faiss.IndexFlatL2(embeddings.shape[1]) # Using L2 distance
        index.add(embeddings)
        print(f"FAISS index created with {index.ntotal} vectors.")
        return index, text_chunks # Return chunks along with index
    except Exception as e:
        st.error(f"Error creating FAISS index: {e}")
        traceback.print_exc()
        return None, None

# --- Gemini API Call Function (Modified for RAG) ---
async def get_gemini_response(query: str, context: str = None) -> str:
    if not GEMINI_API_KEY:
        return "Error: API Key not configured."

    # Construct the prompt: include context if available
    if context:
        final_prompt = f"Based on the following context, answer the user's query.\n\nContext:\n{context}\n\nUser Query: {query}"
    else:
        final_prompt = query

    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'StreamlitApp/1.0'
    }
    params = {'key': GEMINI_API_KEY}
    payload = {"contents": [{"parts": [{"text": final_prompt}]}]}

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(GEMINI_API_URL, params=params, headers=headers, json=payload)
            response.raise_for_status()
        response_data = response.json()

        # (Same safe extraction logic as before)
        if 'candidates' in response_data and isinstance(response_data['candidates'], list) and len(response_data['candidates']) > 0:
            candidate = response_data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content'] and isinstance(candidate['content']['parts'], list) and len(candidate['content']['parts']) > 0:
                if 'text' in candidate['content']['parts'][0]:
                    return candidate['content']['parts'][0]['text']
                else: return "Error: Malformed response (missing text)."
            else: return "Error: Malformed response (missing content/parts)."
        elif 'error' in response_data:
             error_message = response_data.get('error', {}).get('message', 'Unknown API error')
             return f"Error: {error_message}"
        else: return "Error: Unexpected response format."

    except httpx.HTTPStatusError as e:
        print(f"HTTP error: {e.response.status_code} - {e.response.text}")
        return f"Error: Service returned status {e.response.status_code}. Check API key/quotas."
    except httpx.RequestError as e:
        print(f"Request error: {e}")
        return "Error: Could not connect to API. Check network."
    except Exception as e:
        print(f"Unexpected error: {e}")
        traceback.print_exc()
        return "Error: An unexpected error occurred."

# --- Streamlit App Layout & Logic ---
st.title("🚀 MAX AI - RAG Enhanced Chat")

# Initialize session state variables
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "Welcome! Upload a PDF document in the sidebar to enable RAG capabilities."}]
if "vector_store" not in st.session_state:
    st.session_state.vector_store = None
if "text_chunks" not in st.session_state:
    st.session_state.text_chunks = None
if "processed_filename" not in st.session_state:
    st.session_state.processed_filename = None

# --- Sidebar --- 
st.sidebar.header("⚙️ Controls")
if st.sidebar.button("Clear Chat History", key="clear_chat"):
    st.session_state.messages = [{"role": "assistant", "content": "Chat history cleared. Ready for new commands."}]
    # Optionally clear RAG state too
    st.session_state.vector_store = None
    st.session_state.text_chunks = None
    st.session_state.processed_filename = None
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.header("📚 Knowledge Base (RAG)")

uploaded_file = st.sidebar.file_uploader("Upload PDF Document", type=["pdf"])

if uploaded_file is not None:
    # Process the file only if it's different from the last processed one
    if uploaded_file.name != st.session_state.processed_filename:
        st.sidebar.info(f"Processing `{uploaded_file.name}`...")
        with st.spinner("Extracting text, creating embeddings, and building index..."):
            # Save to a temporary file to read with PdfReader
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_file_path = tmp_file.name
            
            try:
                # 1. Extract Text
                raw_text = extract_text_from_pdf(tmp_file_path)
                if raw_text:
                    # 2. Split Text
                    text_chunks = split_text(raw_text)
                    # 3. Create FAISS Index
                    vector_store, stored_chunks = create_faiss_index(text_chunks, embedding_model)
                    
                    if vector_store is not None:
                        st.session_state.vector_store = vector_store
                        st.session_state.text_chunks = stored_chunks # Store the actual chunks used
                        st.session_state.processed_filename = uploaded_file.name
                        st.sidebar.success(f"✅ `{uploaded_file.name}` processed and ready for Q&A!")
                    else:
                        st.sidebar.error("Failed to create vector store.")
                        st.session_state.processed_filename = None # Reset filename if failed
                else:
                    st.sidebar.error("Failed to extract text from PDF.")
                    st.session_state.processed_filename = None # Reset filename if failed
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_file_path):
                    os.remove(tmp_file_path)
    elif st.session_state.vector_store is not None:
         st.sidebar.success(f"✅ `{st.session_state.processed_filename}` is loaded.")

elif st.session_state.processed_filename:
     st.sidebar.warning(f"No file uploaded, but `{st.session_state.processed_filename}` was previously loaded. Upload again if needed.")

st.sidebar.markdown("---")
st.sidebar.info("Powered by Google Gemini API, FAISS & Streamlit.")

# --- Main Chat Area --- 
chat_container = st.container()
with chat_container:
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

# API Key Check
if not GEMINI_API_KEY:
    st.error("⚠️ Gemini API Key not found! Please set it in your `.env` file or Streamlit secrets and restart.", icon="🚨")
    st.stop()

# Chat input
if prompt := st.chat_input("Ask a question about the document or anything else..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with chat_container:
        with st.chat_message("user"):
            st.markdown(prompt)

    # Get AI response (with RAG if applicable)
    with chat_container:
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            message_placeholder.markdown("Thinking... <span style='color: #34d399;'>█</span>", unsafe_allow_html=True)
            
            context_for_query = None
            rag_info = "" # Info text to add if RAG is used
            
            # RAG Logic: Search vector store if it exists
            if st.session_state.vector_store is not None and st.session_state.text_chunks is not None:
                try:
                    print(f"Searching vector store for query: {prompt}")
                    query_embedding = embedding_model.encode([prompt]).astype("float32")
                    k = 3 # Number of relevant chunks to retrieve
                    distances, indices = st.session_state.vector_store.search(query_embedding, k)
                    
                    # Get the actual text chunks
                    relevant_chunks = [st.session_state.text_chunks[i] for i in indices[0]]
                    context_for_query = "\n\n---\n\n".join(relevant_chunks)
                    print(f"Found relevant context: {context_for_query[:200]}...") # Log snippet
                    rag_info = f"*(Answer based on `{st.session_state.processed_filename}`)*\n\n" # Add attribution
                except Exception as e:
                    st.warning(f"Could not perform RAG search: {e}")
                    traceback.print_exc()
            
            # Call Gemini (with or without context)
            try:
                response_text = asyncio.run(get_gemini_response(prompt, context=context_for_query))
                final_response = rag_info + response_text # Prepend RAG info if used
                message_placeholder.markdown(final_response)
                st.session_state.messages.append({"role": "assistant", "content": final_response})
            except Exception as e:
                error_msg = f"Error processing request: {e}"
                message_placeholder.error(error_msg)
                st.session_state.messages.append({"role": "assistant", "content": error_msg})


