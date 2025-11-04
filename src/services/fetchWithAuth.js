// fetchWithAuth.js
let onTokenExpiredHandler = null;

export const setOnTokenExpired = (callback) => {
  onTokenExpiredHandler = callback;
};

export const fetchWithAuth = async (input, options = {}) => {
  const url = input instanceof URL ? input.toString() : input;

  try {
    const response = await fetch(url, options);

    if (response.status === 401 && onTokenExpiredHandler) {
      onTokenExpiredHandler(); // Trigger modal
      return null;
    }

    return response;
  } catch (err) {
    console.error("Fetch failed:", err);
    throw new Error("Network error or invalid URL");
  }
};
