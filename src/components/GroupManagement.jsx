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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const addFriend = () => {
    setGroupFriends([...groupFriends, ""]);
  };

  const updateFriend = (index, value) => {
    const updatedFriends = [...groupFriends];
    updatedFriends[index] = value;
    setGroupFriends(updatedFriends);
  };

  const removeFriend = (index) => {
    const updatedFriends = groupFriends.filter((_, i) => i !== index);
    setGroupFriends(updatedFriends);
  };

  const handleCreateGroup = () => {
    const validFriends = groupFriends.filter((friend) => friend.trim());
    if (validFriends.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one friend",
        variant: "destructive",
      });
      return;
    }
    createNewGroup(validFriends);
    setIsCreateOpen(false);
    setGroupFriends([""]);
    setNewGroupName("");
  };

  const openEditDialog = () => {
    if (currentGroup) {
      setEditGroupName(currentGroup.name);
      setEditGroupFriends([...currentGroup.friends]);
      setIsEditOpen(true);
    }
  };

  const addEditFriend = () => {
    setEditGroupFriends([...editGroupFriends, ""]);
  };

  const updateEditFriend = (index, value) => {
    const updatedFriends = [...editGroupFriends];
    updatedFriends[index] = value;
    setEditGroupFriends(updatedFriends);
  };

  const removeEditFriend = (index) => {
    const updatedFriends = editGroupFriends.filter((_, i) => i !== index);
    setEditGroupFriends(updatedFriends);
  };

  const handleUpdateGroup = () => {
    const validFriends = editGroupFriends.filter((friend) => friend.trim());
    if (validFriends.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one friend",
        variant: "destructive",
      });
      return;
    }

    updateGroup(currentGroupId, {
      name: editGroupName,
      friends: validFriends,
    });

    setIsEditOpen(false);
  };

  const handleDeleteGroup = () => {
    deleteGroup(currentGroupId);
    setIsDeleteOpen(false);
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
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {currentGroupId && (
                <>
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteOpen(true)}
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
              >
                <Plus className="h-4 w-4 mr-1" />
                New Group
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={() => setIsCreateOpen(true)}>
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Friends</label>
              <div className="space-y-2">
                {groupFriends.map((friend, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={friend}
                      onChange={(e) => updateFriend(index, e.target.value)}
                      placeholder="Friend's name"
                      className="flex-1"
                    />
                    {groupFriends.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeFriend(index)}
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
                onClick={addFriend}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Friends</label>
              <div className="space-y-2">
                {editGroupFriends.map((friend, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={friend}
                      onChange={(e) => updateEditFriend(index, e.target.value)}
                      placeholder="Friend's name"
                      className="flex-1"
                    />
                    {editGroupFriends.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeEditFriend(index)}
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
                onClick={addEditFriend}
                className="mt-2"
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
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be
              undone and will remove all associated expenses and settlements.
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
