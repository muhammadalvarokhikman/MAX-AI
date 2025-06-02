// lib/api.ts

// Get the backend API URL from environment variables.
// This needs to be set during the build process or in Netlify's environment settings.
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'; // Default to localhost for local dev

if (!process.env.NEXT_PUBLIC_BACKEND_API_URL) {
  console.warn("Warning: NEXT_PUBLIC_BACKEND_API_URL environment variable not set. Defaulting to http://localhost:8000. Set this in your Netlify environment for deployment.");
}

/**
 * Sends a query to the backend API and returns the response.
 * @param prompt The user's query.
 * @param history The chat history (optional).
 * @returns The AI's response text.
 */
const generateResponse = async (
  prompt: string,
  history: string[] = []
): Promise<string> => {
  console.log(`Sending query to backend: ${BACKEND_API_URL}/query`);
  try {
    const response = await fetch(`${BACKEND_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: prompt, history }),
    });

    if (!response.ok) {
      // Try to get error details from the backend response body
      let errorDetail = `HTTP error! status: ${response.status}`;
      try {
          const errorData = await response.json();
          errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
          // Ignore if response body is not JSON or empty
      }
      console.error("Backend API error:", errorDetail);
      throw new Error(`Backend error: ${errorDetail}`);
    }

    const data = await response.json();
    // Assuming the backend response structure is { response: string, sources: string[] }
    return data.response;
  } catch (error) {
    console.error("Error calling generateResponse API:", error);
    // Re-throw the error so the UI can handle it (e.g., show a toast message)
    throw error;
  }
};

/**
 * Uploads a document to the backend for indexing.
 * @param file The file to upload.
 * @returns The result of the indexing operation (e.g., document ID or success message).
 */
const indexDocument = async (file: File): Promise<any> => { // Return type can be more specific
  console.log(`Uploading document to backend: ${BACKEND_API_URL}/index`);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BACKEND_API_URL}/index`, {
      method: 'POST',
      body: formData, // FormData sets the Content-Type header automatically
    });

    if (!response.ok) {
      let errorDetail = `HTTP error! status: ${response.status}`;
       try {
          const errorData = await response.json();
          errorDetail = errorData.detail || JSON.stringify(errorData);
      } catch (e) { 
          // Ignore if response body is not JSON or empty
      }
      console.error("Backend API error during indexing:", errorDetail);
      throw new Error(`Backend error during indexing: ${errorDetail}`);
    }

    const data = await response.json();
    // Assuming the backend response structure is { message: string, filename: string, doc_id: string }
    console.log("Document indexing response:", data);
    return data; // Return the full response data for now
  } catch (error) {
    console.error("Error calling indexDocument API:", error);
    throw error;
  }
};

export const api = {
  generateResponse,
  indexDocument,
};

