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
import { Loader2 } from "lucide-react"; // Import Loader2 icon from lucide-react

export const ExpenseManager = () => {
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [expenseGroups, setExpenseGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [dataLoading, setDataLoading] = useState(true); // Add dataLoading state for initial data fetch
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
      setDataLoading(true); // Set dataLoading true when loading new group
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
      toast({
        title: "Error",
        description: "Failed to load expense groups",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
      return null;
    }
  };

  const loadSettlements = async () => {
    if (!currentGroupId) return;

    // Retrieve the entire user object from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if the user object and the token exist
    if (!user || !user.token) {
      toast({
        title: "Error",
        description: "No token found, please log in again",
        variant: "destructive",
      });
      return;
    }

    const token = user.token;

    try {
      const response = await fetch(
        `${API_URL}/api/expense-groups/${currentGroupId}/settlements`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch settlements");
      const data = await response.json();
      setSettlements(data);
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settlements",
        variant: "destructive",
      });
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

  const handleAddExpense = async (expenseData) => {
    setLoading(true);
    try {
      await expenseGroupService.addExpense(currentGroupId, {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        // Ensure date is sent in ISO format if needed
        date:
          expenseData.date instanceof Date
            ? expenseData.date.toISOString()
            : expenseData.date,
      });

      await loadCurrentGroup();
      await loadSettlements();

      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (index) => {
    if (!currentGroup) return;
    setLoading(true);
    const updatedFriends = currentGroup.friends.filter((_, i) => i !== index);

    try {
      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends,
      });

      // Update local currentGroup state immediately
      setCurrentGroup((prev) => ({
        ...prev,
        friends: updatedFriends,
      }));

      // Update expenseGroups state immediately
      setExpenseGroups((prev) =>
        prev.map((group) =>
          group._id === currentGroupId
            ? { ...group, friends: updatedFriends }
            : group
        )
      );

      // Then reload from server to ensure consistency
      await loadCurrentGroup();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (name = "") => {
    if (!currentGroup) return;

    const updatedFriends = [...currentGroup.friends, name];

    try {
      setLoading(true);

      // Update local states immediately
      setCurrentGroup((prev) => ({
        ...prev,
        friends: updatedFriends,
      }));

      // Update expenseGroups state immediately
      setExpenseGroups((prev) =>
        prev.map((group) =>
          group._id === currentGroupId
            ? { ...group, friends: updatedFriends }
            : group
        )
      );

      // Make API call
      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends,
      });

      // Reload from server to ensure consistency
      await loadCurrentGroup();
    } catch (error) {
      // If there's an error, revert the local changes
      await loadCurrentGroup();
      toast({
        title: "Error",
        description: "Failed to add friend",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Also update handleUpdateFriend to maintain consistency
  const handleUpdateFriend = async (index, value) => {
    if (!currentGroup) return;
    setLoading(true);
    const updatedFriends = [...currentGroup.friends];
    updatedFriends[index] = value;

    try {
      // Update local states immediately
      setCurrentGroup((prev) => ({
        ...prev,
        friends: updatedFriends,
      }));

      // Update expenseGroups state immediately
      setExpenseGroups((prev) =>
        prev.map((group) =>
          group._id === currentGroupId
            ? { ...group, friends: updatedFriends }
            : group
        )
      );

      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends.filter((friend) => friend.trim()),
      });

      // Reload from server to ensure consistency
      await loadCurrentGroup();
    } catch (error) {
      // If there's an error, revert the local changes
      await loadCurrentGroup();
      toast({
        title: "Error",
        description: "Failed to update friend",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (friends) => {
    if (!newGroupName) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newGroup = await expenseGroupService.createGroup({
        name: newGroupName,
        friends,
        expenses: [],
      });

      // Reload groups and select the new one
      await loadExpenseGroups();
      setCurrentGroupId(newGroup._id);

      toast({
        title: "Success",
        description: "Group created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
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

      // Reload groups to reflect name changes in dropdown
      await loadExpenseGroups();
      // Reload current group to update UI
      await loadCurrentGroup();

      toast({
        title: "Success",
        description: "Group updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    setLoading(true);
    try {
      await expenseGroupService.deleteGroup(groupId);

      // Reload groups
      const updatedGroups = await expenseGroupService.getGroups();
      setExpenseGroups(updatedGroups);

      // Set current group to the first available group or null
      if (updatedGroups.length > 0) {
        setCurrentGroupId(updatedGroups[0]._id);
      } else {
        setCurrentGroupId("");
        setCurrentGroup(null);
      }

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner component
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
                updateFriend={handleUpdateFriend}
                removeFriend={handleRemoveFriend}
                addFriend={handleAddFriend}
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
