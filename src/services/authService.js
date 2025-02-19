const API_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_PROD;

export const authService = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error("Login failed");
    const data = await response.json();
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Registration failed");
    const data = await response.json();
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
