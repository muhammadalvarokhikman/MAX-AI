import streamlit as st
import os
import httpx
import asyncio
from dotenv import load_dotenv
import traceback

# Load environment variables from .env file
# Make sure to create a .env file with your GEMINI_API_KEY
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# --- Gemini API Call Function (using httpx async) ---

async def get_gemini_response(query: str) -> str:
    """Calls the Gemini API and returns the text response."""
    # API Key check is done before calling this function in the main app flow
    # but keeping a check here is safe in case it's called directly elsewhere.
    if not GEMINI_API_KEY:
        return "Error: API Key not configured."

    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'StreamlitApp/1.0'
    }
    params = {'key': GEMINI_API_KEY}
    payload = {"contents": [{"parts": [{"text": query}]}]}

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(GEMINI_API_URL, params=params, headers=headers, json=payload)
            response.raise_for_status() # Raise HTTPStatusError for bad responses
        response_data = response.json()

        # Safely extract text from response
        if 'candidates' in response_data and isinstance(response_data['candidates'], list) and len(response_data['candidates']) > 0:
            candidate = response_data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content'] and isinstance(candidate['content']['parts'], list) and len(candidate['content']['parts']) > 0:
                if 'text' in candidate['content']['parts'][0]:
                    return candidate['content']['parts'][0]['text']
                else: return "Error: Malformed response from API (missing text)."
            else: return "Error: Malformed response from API (missing content/parts)."
        elif 'error' in response_data:
             error_details = response_data.get('error', {})
             error_message = error_details.get('message', 'Unknown API error')
             return f"Error: {error_message}"
        else: return "Error: Unexpected response format from API."

    except httpx.HTTPStatusError as e:
        # Log the error for debugging
        print(f"HTTP error calling Gemini API: {e.response.status_code} - {e.response.text}")
        return f"Error: Service returned status {e.response.status_code}. Please check API key or quotas."
    except httpx.RequestError as e:
        print(f"Request error calling Gemini API: {e}")
        return "Error: Could not connect to Gemini API. Check network connection."
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        traceback.print_exc()
        return "Error: An unexpected error occurred."

# --- Streamlit Chat UI Implementation ---

st.set_page_config(page_title="MAX AI Streamlit", page_icon="🤖")
st.title("MAX AI Chatbot (Streamlit Version)")

# Initialize chat history in session state if it doesn't exist
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "Halo! Saya MAX AI versi Streamlit. Apa yang bisa saya bantu hari ini?"}]

# Display existing messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Check for API Key before showing chat input
if not GEMINI_API_KEY:
    st.warning("Kunci API Gemini belum diatur. Silakan buat file `.env` di direktori `max_ai_streamlit` dan tambahkan `GEMINI_API_KEY=KUNCI_ANDA`. Setelah itu, refresh halaman ini.", icon="⚠️")
    st.stop() # Stop execution if no API key

# Chat input field appears only if API key is present
if prompt := st.chat_input("Ketik pesan Anda di sini..."):
    # Add user message to history and display it
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Get AI response and display it
    with st.chat_message("assistant"):
        message_placeholder = st.empty() # Use a placeholder for streaming-like effect
        message_placeholder.markdown("Memproses...⏳")
        try:
            # Run the async function to get response
            response_text = asyncio.run(get_gemini_response(prompt))
            message_placeholder.markdown(response_text)
            # Add AI response to history
            st.session_state.messages.append({"role": "assistant", "content": response_text})
        except Exception as e:
            # Catch any unexpected error during the async call itself
            error_msg = f"Terjadi kesalahan saat memproses permintaan: {e}"
            message_placeholder.error(error_msg)
            st.session_state.messages.append({"role": "assistant", "content": error_msg}) # Log error to history

# Optional: Add a button to clear chat history in the sidebar
st.sidebar.title("Opsi")
if st.sidebar.button("Hapus Riwayat Chat"):
    st.session_state.messages = [{"role": "assistant", "content": "Riwayat chat dihapus. Ada lagi yang bisa saya bantu?"}]
    st.rerun()

st.sidebar.info("Aplikasi ini menggunakan Google Gemini API.")

# Instructions in sidebar
st.sidebar.markdown("---")
st.sidebar.header("Cara Menjalankan:")
st.sidebar.code("1. Buat file .env\n   GEMINI_API_KEY=ISI_KUNCI_ANDA\n2. source venv/bin/activate\n3. streamlit run app.py")

