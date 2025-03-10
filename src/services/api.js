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

export const expenseGroupService = {
  // Get all expense groups
  getGroups: async () => {
    const response = await fetch(`${API_URL}/api/expense-groups`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch groups");
    return response.json();
  },

  // Get single group
  getGroup: async (groupId) => {
    const response = await fetch(`${API_URL}/api/expense-groups/${groupId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch group");
    return response.json();
  },

  // Create new group
  createGroup: async (groupData) => {
    const response = await fetch(`${API_URL}/api/expense-groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) throw new Error("Failed to create group");
    return response.json();
  },

  // Update group
  updateGroup: async (groupId, groupData) => {
    const response = await fetch(`${API_URL}/api/expense-groups/${groupId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) throw new Error("Failed to update group");
    return response.json();
  },

  // Delete group
  deleteGroup: async (groupId) => {
    const response = await fetch(`${API_URL}/api/expense-groups/${groupId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete group");

    // For 204 responses, don't attempt to parse JSON
    if (response.status === 204) {
      return { id: groupId };
    }

    return response.json();
  },

  // Add expense
  addExpense: async (groupId, expenseData) => {
    const response = await fetch(
      `${API_URL}/api/expense-groups/${groupId}/expenses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify(expenseData),
      }
    );
    if (!response.ok) throw new Error("Failed to add expense");
    return response.json();
  },

  // Delete expense
  deleteExpense: async (groupId, expenseId) => {
    const response = await fetch(
      `${API_URL}/api/expense-groups/${groupId}/expenses/${expenseId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to delete expense");
    return response.json();
  },

  // Complete settlement
  completeSettlement: async (groupId, settlementId) => {
    const response = await fetch(
      `${API_URL}/api/expense-groups/${groupId}/settlements/${settlementId}/complete`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to complete settlement");
    return response.json();
  },
};
