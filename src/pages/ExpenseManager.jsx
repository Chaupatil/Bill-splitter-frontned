import React, { useState, useEffect } from "react";
import { ExpenseForm } from "../components/ExpenseForm";
import { ExpensesList } from "../components/ExpensesList";
import { GroupManagement } from "../components/GroupManagement";
import { FriendsList } from "../components/FriendsList";
import { Summary } from "../components/Summary";
import { SettleUp } from "../components/SettleUp";
import { expenseGroupService } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export const ExpenseManager = () => {
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [expenseGroups, setExpenseGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    perPersonOwed: {},
    detailedBalances: [],
  });
  const [newGroupName, setNewGroupName] = useState("");
  const { toast } = useToast();

  const API_URL =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_URL_DEV
      : import.meta.env.VITE_API_URL_PROD;

  // Load expense groups on mount
  useEffect(() => {
    loadExpenseGroups();
  }, []);

  // Load current group when selected
  useEffect(() => {
    if (currentGroupId) {
      setDataLoading(true);
      Promise.all([loadCurrentGroup(), loadSettlements()])
        .then(() => setDataLoading(false))
        .catch(() => setDataLoading(false));
    }
  }, [currentGroupId]);

  // Calculate summary whenever group data changes
  useEffect(() => {
    if (currentGroup) {
      calculateSummary();
    }
  }, [currentGroup]);

  const loadExpenseGroups = async () => {
    setLoading(true);
    try {
      const groups = await expenseGroupService.getGroups();
      setExpenseGroups(groups);

      if (groups.length > 0 && !currentGroupId) {
        setCurrentGroupId(groups[0]._id);
      }
    } catch (error) {
      showErrorToast("Failed to load expense groups");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentGroup = async () => {
    try {
      const group = await expenseGroupService.getGroup(currentGroupId);
      setCurrentGroup(group);
      return group;
    } catch (error) {
      showErrorToast("Failed to load group details");
      return null;
    }
  };

  const loadSettlements = async () => {
    if (!currentGroupId) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      showErrorToast("No token found, please log in again");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/expense-groups/${currentGroupId}/settlements`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch settlements");
      const data = await response.json();
      setSettlements(data);
      return data;
    } catch (error) {
      showErrorToast("Failed to load settlements");
      return [];
    }
  };

  const calculateSummary = () => {
    if (!currentGroup) return;

    const totalExpenses = currentGroup.expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );

    const validFriends = currentGroup.friends.filter((friend) => friend.trim());
    const perPersonShare = totalExpenses / validFriends.length;
    const perPersonOwed = {};

    validFriends.forEach((friend) => {
      const paid = currentGroup.expenses
        .filter((expense) => expense.paidBy === friend)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      perPersonOwed[friend] = paid - perPersonShare;
    });

    // Calculate detailed balances (who owes whom)
    const detailedBalances = [];
    const creditors = Object.entries(perPersonOwed)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);

    const debtors = Object.entries(perPersonOwed)
      .filter(([_, amount]) => amount < 0)
      .sort((a, b) => a[1] - b[1]);

    // Generate detailed balance transactions
    while (creditors.length > 0 && debtors.length > 0) {
      const [creditor, creditAmount] = creditors[0];
      const [debtor, debtAmount] = debtors[0];

      const transferAmount = Math.min(creditAmount, Math.abs(debtAmount));

      detailedBalances.push({
        from: debtor,
        to: creditor,
        amount: transferAmount,
      });

      // Update balances
      creditors[0][1] -= transferAmount;
      debtors[0][1] += transferAmount;

      // Remove settled parties
      if (Math.abs(creditors[0][1]) < 0.01) creditors.shift();
      if (Math.abs(debtors[0][1]) < 0.01) debtors.shift();
    }

    setSummary({
      totalExpenses,
      perPersonOwed,
      detailedBalances,
    });
  };

  // Helper functions
  const showErrorToast = (message) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const showSuccessToast = (message) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  const updateGroupInState = (groupId, updatedData) => {
    // Update current group if it's the one being modified
    if (groupId === currentGroupId) {
      setCurrentGroup((prev) => ({
        ...prev,
        ...updatedData,
      }));
    }

    // Update group in the groups list
    setExpenseGroups((prev) =>
      prev.map((group) =>
        group._id === groupId ? { ...group, ...updatedData } : group
      )
    );
  };

  // CRUD operations
  const handleAddExpense = async (expenseData) => {
    setLoading(true);
    try {
      await expenseGroupService.addExpense(currentGroupId, {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        date:
          expenseData.date instanceof Date
            ? expenseData.date.toISOString()
            : expenseData.date,
      });

      await loadCurrentGroup();
      await loadSettlements();
      showSuccessToast("Expense added successfully");
    } catch (error) {
      showErrorToast("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setLoading(true);
    try {
      await expenseGroupService.deleteExpense(currentGroupId, expenseId);
      await loadCurrentGroup();
      await loadSettlements();
      showSuccessToast("Expense deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete expense");
    } finally {
      setLoading(false);
    }
  };

  const handleFriendOperation = async (operation, index = null, value = "") => {
    if (!currentGroup) return;
    setLoading(true);

    let updatedFriends;

    switch (operation) {
      case "add":
        updatedFriends = [...currentGroup.friends, value];
        break;
      case "remove":
        updatedFriends = currentGroup.friends.filter((_, i) => i !== index);
        break;
      case "update":
        updatedFriends = [...currentGroup.friends];
        updatedFriends[index] = value;
        break;
      default:
        setLoading(false);
        return;
    }

    try {
      // Optimistic update
      updateGroupInState(currentGroupId, { friends: updatedFriends });

      // Server update
      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends.filter((friend) => friend.trim()),
      });

      // Ensure consistency
      await loadCurrentGroup();
    } catch (error) {
      // Revert on error
      await loadCurrentGroup();
      showErrorToast(`Failed to ${operation} friend`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (friends) => {
    if (!newGroupName) {
      showErrorToast("Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      const newGroup = await expenseGroupService.createGroup({
        name: newGroupName,
        friends,
        expenses: [],
      });

      await loadExpenseGroups();
      setCurrentGroupId(newGroup._id);
      showSuccessToast("Group created successfully");
    } catch (error) {
      showErrorToast("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (groupId, groupData) => {
    setLoading(true);
    try {
      await expenseGroupService.updateGroup(groupId, {
        ...currentGroup,
        name: groupData.name,
        friends: groupData.friends,
      });

      await loadExpenseGroups();
      await loadCurrentGroup();
      showSuccessToast("Group updated successfully");
    } catch (error) {
      showErrorToast("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    setLoading(true);
    try {
      await expenseGroupService.deleteGroup(groupId);

      const updatedGroups = await expenseGroupService.getGroups();
      setExpenseGroups(updatedGroups);

      if (updatedGroups.length > 0) {
        setCurrentGroupId(updatedGroups[0]._id);
      } else {
        setCurrentGroupId("");
        setCurrentGroup(null);
      }

      showSuccessToast("Group deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  // Simplified component for loading spinner
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      <GroupManagement
        currentGroupId={currentGroupId}
        expenseGroups={expenseGroups}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        onGroupChange={setCurrentGroupId}
        createNewGroup={handleCreateGroup}
        updateGroup={handleUpdateGroup}
        deleteGroup={handleDeleteGroup}
        loading={loading}
      />

      {loading && !currentGroup && <LoadingSpinner />}

      {currentGroup && (
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseForm
              friends={currentGroup.friends}
              onAddExpense={handleAddExpense}
              loading={loading}
            />
            {dataLoading ? (
              <LoadingSpinner />
            ) : (
              <ExpensesList
                expenses={currentGroup.expenses}
                onDeleteExpense={handleDeleteExpense}
              />
            )}
          </TabsContent>

          <TabsContent value="summary">
            {dataLoading ? (
              <LoadingSpinner />
            ) : (
              <Summary summary={summary} friends={currentGroup.friends} />
            )}
          </TabsContent>

          <TabsContent value="friends">
            {dataLoading ? (
              <LoadingSpinner />
            ) : (
              <FriendsList
                friends={currentGroup.friends}
                updateFriend={(index, value) =>
                  handleFriendOperation("update", index, value)
                }
                removeFriend={(index) => handleFriendOperation("remove", index)}
                addFriend={(name) => handleFriendOperation("add", null, name)}
                loading={loading}
              />
            )}
          </TabsContent>

          <TabsContent value="settlements">
            {dataLoading ? (
              <LoadingSpinner />
            ) : (
              <SettleUp
                groupId={currentGroupId}
                settlements={settlements}
                onSettlementsUpdated={loadSettlements}
                summary={summary}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
