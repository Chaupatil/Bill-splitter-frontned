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
  const [dialogState, setDialogState] = useState({
    isCreateOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
  });
  const [groupFriends, setGroupFriends] = useState([""]);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupFriends, setEditGroupFriends] = useState([]);

  const currentGroup = expenseGroups.find(
    (group) => group._id === currentGroupId
  );

  // Helper functions
  const showToast = (type, message) => {
    toast({
      title:
        type === "error" ? "Error" : type === "warning" ? "Warning" : "Success",
      description: message,
      variant:
        type === "error" || type === "warning" ? "destructive" : "default",
    });
  };

  const openDialog = (dialogType) => {
    const newState = {
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
    };

    newState[dialogType] = true;
    setDialogState(newState);

    if (dialogType === "isEditOpen" && currentGroup) {
      setEditGroupName(currentGroup.name);
      setEditGroupFriends([...currentGroup.friends]);
    }
  };

  const closeAllDialogs = () => {
    setDialogState({
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
    });
  };

  const resetCreateForm = () => {
    setGroupFriends([""]);
    setNewGroupName("");
  };

  // Validation functions
  const validateGroupName = (name) => {
    if (!name.trim()) {
      showToast("error", "Group name cannot be empty");
      return false;
    }

    const isDuplicate = expenseGroups.some(
      (group) =>
        group.name.toLowerCase() === name.toLowerCase().trim() &&
        group._id !== currentGroupId
    );

    if (isDuplicate) {
      showToast("error", "A group with this name already exists");
      return false;
    }

    return true;
  };

  const validateFriends = (friends) => {
    const validFriends = friends.filter((friend) => friend.trim());

    if (validFriends.length < MIN_FRIENDS) {
      showToast(
        "error",
        `Please add at least ${MIN_FRIENDS} friends to create a group`
      );
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
      showToast("error", "Duplicate friend names are not allowed");
      return null;
    }

    return validFriends;
  };

  // Friend list management
  const handleFriendListChange = (
    friendList,
    setFriendList,
    action,
    index = null,
    value = null
  ) => {
    switch (action) {
      case "add":
        if (friendList.length >= MAX_FRIENDS) {
          showToast(
            "warning",
            `Maximum ${MAX_FRIENDS} friends allowed per group`
          );
          return;
        }

        if (friendList.some((friend) => !friend.trim())) {
          showToast(
            "warning",
            "Please fill in all existing friend names first"
          );
          return;
        }

        setFriendList([...friendList, ""]);
        break;

      case "update":
        const updatedList = [...friendList];
        updatedList[index] = value;
        setFriendList(updatedList);
        break;

      case "remove":
        setFriendList(friendList.filter((_, i) => i !== index));
        break;
    }
  };

  // Action handlers
  const handleCreateGroup = () => {
    if (!validateGroupName(newGroupName)) return;

    const validFriends = validateFriends(groupFriends);
    if (!validFriends) return;

    createNewGroup(validFriends);
    closeAllDialogs();
    resetCreateForm();
    showToast("success", "Group created successfully");
  };

  const handleUpdateGroup = () => {
    if (!validateGroupName(editGroupName)) return;

    const validFriends = validateFriends(editGroupFriends);
    if (!validFriends) return;

    updateGroup(currentGroupId, {
      name: editGroupName,
      friends: validFriends,
    });

    closeAllDialogs();
    showToast("success", "Group updated successfully");
  };

  const handleDeleteGroup = () => {
    deleteGroup(currentGroupId);
    closeAllDialogs();
    showToast("success", "Group deleted successfully");
  };

  // UI Components
  const FriendInputList = ({ friends, setFriends }) => {
    // Local state to track input values
    const [inputValues, setInputValues] = React.useState([...friends]);

    // Update local state when props change (e.g., when resetting the form)
    React.useEffect(() => {
      setInputValues([...friends]);
    }, [friends]);

    // Update parent state only when input loses focus (not on every keystroke)
    const handleBlur = () => {
      setFriends([...inputValues]);
    };

    // Update local state without triggering parent rerenders
    const handleChange = (index, value) => {
      const newValues = [...inputValues];
      newValues[index] = value;
      setInputValues(newValues);
    };

    return (
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {inputValues.map((value, index) => (
          <div key={`friend-input-${index}`} className="flex gap-2 group">
            <Input
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onBlur={handleBlur}
              placeholder="Friend's name"
              className="flex-1"
              maxLength={MAX_GROUP_NAME_LENGTH}
            />
            {inputValues.length > 1 && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  const newValues = inputValues.filter((_, i) => i !== index);
                  setInputValues(newValues);
                  setFriends(newValues);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="h-4 w-4 " />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
        {expenseGroups.length > 0 ? (
          <>
            <Select value={currentGroupId} onValueChange={onGroupChange}>
              <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {expenseGroups.map((group) => (
                  <SelectItem
                    key={group._id}
                    value={group._id}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-xs text-muted-foreground">
                        ({group.friends.length})
                      </span>
                      {group.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {currentGroupId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog("isEditOpen")}
                    className="group flex-1 sm:flex-none cursor-pointer"
                    title="Edit group"
                  >
                    <Edit className="h-4 w-4 mr-1 group-hover:text-primary " />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDialog("isDeleteOpen")}
                    className="group flex-1 sm:flex-none cursor-pointer"
                    title="Delete group"
                  >
                    <Trash2 className="h-4 w-4 mr-1 " />
                    Delete
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => openDialog("isCreateOpen")}
                className="group flex-1 sm:flex-none cursor-pointer"
                title="Create new group"
              >
                <Plus className="h-4 w-4 mr-1 group-hover:text-primary" />
                New Group
              </Button>
            </div>
          </>
        ) : (
          <Button
            onClick={() => openDialog("isCreateOpen")}
            className="w-full sm:w-auto cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Group
          </Button>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog
        open={dialogState.isCreateOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
      >
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

              <FriendInputList
                friends={groupFriends}
                setFriends={setGroupFriends}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleFriendListChange(groupFriends, setGroupFriends, "add")
                }
                className="mt-2 cursor-pointer"
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
                closeAllDialogs();
                resetCreateForm();
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="cursor-pointer"
              disabled={loading}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog
        open={dialogState.isEditOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
      >
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

              <FriendInputList
                friends={editGroupFriends}
                setFriends={setEditGroupFriends}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleFriendListChange(
                    editGroupFriends,
                    setEditGroupFriends,
                    "add"
                  )
                }
                className="mt-2 cursor-pointer"
                disabled={editGroupFriends.length >= MAX_FRIENDS}
              >
                <Plus className="h-4 w-4 mr-2 cursor-pointer" />
                Add Friend
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => closeAllDialogs()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateGroup}
              className="cursor-pointer"
              disabled={loading}
            >
              Update Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogState.isDeleteOpen}
        onOpenChange={(open) => !open && closeAllDialogs()}
      >
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
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => closeAllDialogs()}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
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
