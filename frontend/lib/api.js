/**
 * Chat API client — sends questions to the backend RAG pipeline.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Send a chat message to the backend and return the grounded response.
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: Array, model_info: object }>}
 */
export async function sendMessage(question) {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
