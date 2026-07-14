import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:3230/api";

/**
 * Sends a message + conversation history to the backend and
 * returns the assistant's reply text.
 */
export async function sendMessage(message, history) {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
      history,
    });
    return response.data.reply;
  } catch (error) {
    const serverError = error.response?.data?.error;

    if (serverError) {
      throw new Error(serverError);
    }

    if (error.request) {
      throw new Error(`Couldn't reach the backend at ${API_BASE_URL}.`);
    }

    throw new Error(error.message || "Request failed.");
  }
}
