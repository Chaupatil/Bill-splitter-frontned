// import api from "./api";

// // Get all personal expenses
// export const getPersonalExpenses = async (params = {}) => {
//   try {
//     const response = await api.get("/personal-expenses", { params });
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// // Add new personal expense
// export const addPersonalExpense = async (expenseData) => {
//   try {
//     const response = await api.post("/personal-expenses", expenseData);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// // Get a single personal expense
// export const getPersonalExpenseById = async (id) => {
//   try {
//     const response = await api.get(`/personal-expenses/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// // Update personal expense
// export const updatePersonalExpense = async (id, expenseData) => {
//   try {
//     const response = await api.put(`/personal-expenses/${id}`, expenseData);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// // Delete personal expense
// export const deletePersonalExpense = async (id) => {
//   try {
//     const response = await api.delete(`/personal-expenses/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// // Get expense statistics
// export const getExpenseStats = async (params = {}) => {
//   try {
//     const response = await api.get("/personal-expenses/stats/summary", {
//       params,
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

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
};
