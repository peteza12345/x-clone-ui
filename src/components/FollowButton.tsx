"use client";

import { followUser } from "@/action";
import { useState, useOptimistic, startTransition } from "react";

interface FollowButtonProps {
  userId?: string;
  isFollowed?: boolean;
  username?: string;
}

const FollowButton = ({ userId, isFollowed, username }: FollowButtonProps) => {
  const [state, setState] = useState(isFollowed);
  const [loading, setLoading] = useState(false);

  const [optimisticFollow, switchOptimisticFollow] = useOptimistic(
    state,
    (prev) => !prev
  );

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId || loading) return;

    setLoading(true);
    startTransition(async () => {
      switchOptimisticFollow("");
      await followUser(userId);
      setState(!state);
      setLoading(false);
    });
  };
  console.log("username", username);

  return (
    <button
      type='button'
      onClick={handleFollow}
      className='py-2 px-4 bg-white text-black font-bold rounded-full'
      aria-pressed={optimisticFollow}
      aria-label={
        optimisticFollow ? `Unfollow ${username}` : `Follow ${username}`
      }
      title={optimisticFollow ? `Unfollow ${username}` : `Follow ${username}`}
      disabled={loading || !userId}
    >
      {loading ? "Loading..." : optimisticFollow ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
