import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, AlertCircle, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MAX_GROUP_NAME_LENGTH = 50;
const MAX_FRIENDS = 20;
const MIN_FRIENDS = 2;

export const GroupManagement = ({
  currentGroupId,
  expenseGroups,
  newGroupName,
  setNewGroupName,
  onGroupChange,
  createNewGroup,
  updateGroup,
  deleteGroup,
  loading,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [groupFriends, setGroupFriends] = useState([""]);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupFriends, setEditGroupFriends] = useState([]);

  const currentGroup = expenseGroups.find(
    (group) => group._id === currentGroupId
  );

  const validateGroupName = (name) => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    const isDuplicate = expenseGroups.some(
      (group) =>
        group.name.toLowerCase() === name.toLowerCase().trim() &&
        group._id !== currentGroupId
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "A group with this name already exists",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateFriends = (friends) => {
    const validFriends = friends.filter((friend) => friend.trim());

    if (validFriends.length < MIN_FRIENDS) {
      toast({
        title: "Error",
        description: `Please add at least ${MIN_FRIENDS} friends to create a group`,
        variant: "destructive",
      });
      return null;
    }

    // Check for duplicate friends
    const duplicates = validFriends.filter(
      (friend, index) =>
        validFriends.findIndex(
          (f) => f.toLowerCase() === friend.toLowerCase()
        ) !== index
    );

    if (duplicates.length > 0) {
      toast({
        title: "Error",
        description: "Duplicate friend names are not allowed",
        variant: "destructive",
      });
      return null;
    }

    return validFriends;
  };

  const handleAddFriend = (friends, setFriends) => {
    if (friends.length >= MAX_FRIENDS) {
      toast({
        title: "Limit Reached",
        description: `Maximum ${MAX_FRIENDS} friends allowed per group`,
        variant: "warning",
      });
      return;
    }

    if (friends.some((friend) => !friend.trim())) {
      toast({
        title: "Warning",
        description: "Please fill in all existing friend names first",
        variant: "warning",
      });
      return;
    }

    setFriends([...friends, ""]);
  };

  const handleCreateGroup = () => {
    if (!validateGroupName(newGroupName)) return;

    const validFriends = validateFriends(groupFriends);
    if (!validFriends) return;

    createNewGroup(validFriends);
    setIsCreateOpen(false);
    setGroupFriends([""]);
    setNewGroupName("");

    toast({
      title: "Success",
      description: "Group created successfully",
    });
  };

  const handleUpdateGroup = () => {
    if (!validateGroupName(editGroupName)) return;

    const validFriends = validateFriends(editGroupFriends);
    if (!validFriends) return;

    updateGroup(currentGroupId, {
      name: editGroupName,
      friends: validFriends,
    });

    setIsEditOpen(false);

    toast({
      title: "Success",
      description: "Group updated successfully",
    });
  };

  const handleDeleteGroup = () => {
    deleteGroup(currentGroupId);
    setIsDeleteOpen(false);

    toast({
      title: "Success",
      description: "Group deleted successfully",
    });
  };

  const openEditDialog = () => {
    if (currentGroup) {
      setEditGroupName(currentGroup.name);
      setEditGroupFriends([...currentGroup.friends]);
      setIsEditOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        {expenseGroups.length > 0 ? (
          <>
            <Select value={currentGroupId} onValueChange={onGroupChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {expenseGroups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {group.name}
                      <span className="text-xs text-muted-foreground">
                        ({group.friends.length})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {currentGroupId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditDialog}
                    className="group"
                    title="Edit group"
                  >
                    <Edit className="h-4 w-4 mr-1 group-hover:text-primary" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteOpen(true)}
                    className="group"
                    title="Delete group"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="group"
                title="Create new group"
              >
                <Plus className="h-4 w-4 mr-1 group-hover:text-primary" />
                New Group
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Group
          </Button>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Expense Group</DialogTitle>
            <DialogDescription>
              Create a new group to track expenses with friends.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                maxLength={MAX_GROUP_NAME_LENGTH}
              />
              <p className="text-xs text-muted-foreground">
                {newGroupName.length}/{MAX_GROUP_NAME_LENGTH} characters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Friends</label>
                <span className="text-xs text-muted-foreground">
                  {groupFriends.filter((f) => f.trim()).length}/{MAX_FRIENDS}{" "}
                  friends
                </span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {groupFriends.map((friend, index) => (
                  <div key={index} className="flex gap-2 group">
                    <Input
                      value={friend}
                      onChange={(e) => {
                        const updatedFriends = [...groupFriends];
                        updatedFriends[index] = e.target.value;
                        setGroupFriends(updatedFriends);
                      }}
                      placeholder="Friend's name"
                      className="flex-1"
                      maxLength={MAX_GROUP_NAME_LENGTH}
                    />
                    {groupFriends.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const updatedFriends = groupFriends.filter(
                            (_, i) => i !== index
                          );
                          setGroupFriends(updatedFriends);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddFriend(groupFriends, setGroupFriends)}
                className="mt-2"
                disabled={groupFriends.length >= MAX_FRIENDS}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setGroupFriends([""]);
                setNewGroupName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={loading}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense Group</DialogTitle>
            <DialogDescription>
              Update your group name and members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                placeholder="Enter group name"
                maxLength={MAX_GROUP_NAME_LENGTH}
              />
              <p className="text-xs text-muted-foreground">
                {editGroupName.length}/{MAX_GROUP_NAME_LENGTH} characters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Friends</label>
                <span className="text-xs text-muted-foreground">
                  {editGroupFriends.filter((f) => f.trim()).length}/
                  {MAX_FRIENDS} friends
                </span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {editGroupFriends.map((friend, index) => (
                  <div key={index} className="flex gap-2 group">
                    <Input
                      value={friend}
                      onChange={(e) => {
                        const updatedFriends = [...editGroupFriends];
                        updatedFriends[index] = e.target.value;
                        setEditGroupFriends(updatedFriends);
                      }}
                      placeholder="Friend's name"
                      className="flex-1"
                      maxLength={MAX_GROUP_NAME_LENGTH}
                    />
                    {editGroupFriends.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const updatedFriends = editGroupFriends.filter(
                            (_, i) => i !== index
                          );
                          setEditGroupFriends(updatedFriends);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddFriend(editGroupFriends, setEditGroupFriends)
                }
                className="mt-2"
                disabled={editGroupFriends.length >= MAX_FRIENDS}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGroup} disabled={loading}>
              Update Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Group
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentGroup?.name}"? This
              action cannot be undone and will remove all associated expenses
              and settlements.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={loading}
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
