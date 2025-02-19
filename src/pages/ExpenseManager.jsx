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

export const ExpenseManager = () => {
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [expenseGroups, setExpenseGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    perPersonOwed: {},
    detailedBalances: [],
  });
  const [newGroupName, setNewGroupName] = useState("");
  const { toast } = useToast();

  // Load expense groups on mount
  useEffect(() => {
    loadExpenseGroups();
  }, []);

  // Load current group when selected
  useEffect(() => {
    if (currentGroupId) {
      loadCurrentGroup();
      loadSettlements();
    }
  }, [currentGroupId]);

  // Calculate summary whenever group data changes
  useEffect(() => {
    if (currentGroup) {
      calculateSummary();
    }
  }, [currentGroup]);

  const loadExpenseGroups = async () => {
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
    }
  };

  const loadCurrentGroup = async () => {
    try {
      const group = await expenseGroupService.getGroup(currentGroupId);
      setCurrentGroup(group);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
    }
  };

  const loadSettlements = async () => {
    if (!currentGroupId) return;

    try {
      const response = await fetch(
        `https://bill-splitter-backend-peach.vercel.app/api/expense-groups/${currentGroupId}/settlements`
      );
      if (!response.ok) throw new Error("Failed to fetch settlements");
      const data = await response.json();
      setSettlements(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settlements",
        variant: "destructive",
      });
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
    }
  };

  const handleUpdateFriend = async (index, value) => {
    if (!currentGroup) return;

    const updatedFriends = [...currentGroup.friends];
    updatedFriends[index] = value;

    try {
      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends.filter((friend) => friend.trim()),
      });
      await loadCurrentGroup();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update friend",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (index) => {
    if (!currentGroup) return;

    const updatedFriends = currentGroup.friends.filter((_, i) => i !== index);

    try {
      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends,
      });
      await loadCurrentGroup();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  const handleAddFriend = async () => {
    if (!currentGroup) return;

    const updatedFriends = [...currentGroup.friends, ""];

    try {
      setLoading(true);
      await expenseGroupService.updateGroup(currentGroupId, {
        ...currentGroup,
        friends: updatedFriends,
      });
      await loadCurrentGroup();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add friend",
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
            <ExpensesList
              expenses={currentGroup.expenses}
              onDeleteExpense={handleDeleteExpense}
            />
          </TabsContent>

          <TabsContent value="summary">
            <Summary summary={summary} friends={currentGroup.friends} />
          </TabsContent>

          <TabsContent value="friends">
            <FriendsList
              friends={currentGroup.friends}
              updateFriend={handleUpdateFriend}
              removeFriend={handleRemoveFriend}
              addFriend={handleAddFriend}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="settlements">
            <SettleUp
              groupId={currentGroupId}
              settlements={settlements}
              onSettlementsUpdated={loadSettlements}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
