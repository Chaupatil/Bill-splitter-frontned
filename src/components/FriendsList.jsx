import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export const FriendsList = ({
  friends,
  updateFriend,
  removeFriend,
  addFriend,
  loading,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);

  const handleDeleteClick = (index) => {
    setFriendToDelete(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    removeFriend(friendToDelete);
    setDeleteDialogOpen(false);
    setFriendToDelete(null);
    toast({
      title: "Friend removed",
      description: "The friend has been removed from the list.",
    });
  };

  const handleAddFriend = () => {
    // Check if there's any empty friend field
    if (friends.some((friend) => !friend.trim())) {
      toast({
        title: "Warning",
        description:
          "Please fill in all existing friend names before adding a new one.",
        variant: "warning",
      });
      return;
    }
    addFriend();
  };

  const handleFriendUpdate = (index, value) => {
    // Prevent duplicate names
    const isDuplicate = friends.some(
      (friend, i) =>
        i !== index && friend.toLowerCase() === value.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast({
        title: "Warning",
        description: "This friend name already exists in the list.",
        variant: "warning",
      });
      return;
    }

    updateFriend(index, value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Friends</h3>
        <span className="text-sm text-muted-foreground">
          {friends.length} {friends.length === 1 ? "friend" : "friends"}
        </span>
      </div>

      <div className="space-y-2">
        {friends.map((friend, index) => (
          <div key={index} className="flex gap-2 items-center group">
            <Input
              value={friend}
              onChange={(e) => handleFriendUpdate(index, e.target.value)}
              placeholder="Friend's name"
              className="flex-1"
              maxLength={50}
            />
            {friends.length > 1 && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteClick(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove friend"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={handleAddFriend}
        disabled={loading || friends.length >= 20}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Friend
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Removal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this friend? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
