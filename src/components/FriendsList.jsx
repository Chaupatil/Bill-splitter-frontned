// src/components/FriendsList.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export const FriendsList = ({
  friends,
  updateFriend,
  removeFriend,
  addFriend,
  loading,
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Friends</h3>
      <div className="space-y-2">
        {friends.map((friend, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={friend}
              onChange={(e) => updateFriend(index, e.target.value)}
              placeholder="Friend's name"
              className="flex-1"
            />
            {friends.length > 1 && (
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
        className="mt-2"
        onClick={addFriend}
        disabled={loading}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Friend
      </Button>
    </div>
  );
};
