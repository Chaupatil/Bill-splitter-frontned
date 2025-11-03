const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return {
    "Content-Type": "application/json",
    Authorization: user ? `Bearer ${user.token}` : "",
  };
};

const API_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_PROD;

export const personalExpenseService = {
  // Get all personal expenses
  getPersonalExpenses: async (params = {}) => {
    const url = new URL(`${API_URL}/api/personal-expenses`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch personal expenses");
    return response.json();
  },

  // Add new personal expense
  addPersonalExpense: async (expenseData) => {
    const response = await fetch(`${API_URL}/api/personal-expenses`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) throw new Error("Failed to add personal expense");
    return response.json();
  },

  // Bulk add
  addMultipleExpenses: async (expenses) => {
    const response = await fetch(`${API_URL}/api/personal-expenses/bulk-add`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ expenses }),
    });
    if (!response.ok) throw new Error("Failed to add multiple expenses");
    return response.json();
  },

  // Get a single personal expense
  getPersonalExpenseById: async (id) => {
    const response = await fetch(`${API_URL}/api/personal-expenses/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch personal expense");
    return response.json();
  },

  // Update personal expense
  updatePersonalExpense: async (id, expenseData) => {
    const response = await fetch(`${API_URL}/api/personal-expenses/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) throw new Error("Failed to update personal expense");
    return response.json();
  },

  // Delete personal expense
  deletePersonalExpense: async (id) => {
    const response = await fetch(`${API_URL}/api/personal-expenses/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to delete personal expense");
    return response.json();
  },

  // Bulk delete
  deleteMultipleExpenses: async (ids) => {
    const response = await fetch(
      `${API_URL}/api/personal-expenses/bulk-delete`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      }
    );
    if (!response.ok) throw new Error("Failed to delete selected expenses");
    return response.json();
  },

  // Get expense statistics
  getExpenseStats: async (params = {}) => {
    const url = new URL(`${API_URL}/api/personal-expenses/stats/summary`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch expense statistics");
    return response.json();
  },

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_URL}/api/personal-expenses/upload-csv`,
      {
        method: "POST",
        headers: {
          Authorization: getHeaders().Authorization,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload CSV");
    }
    return response.json();
  },
};
