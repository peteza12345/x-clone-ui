"use client";

import { Post as PostType } from "@prisma/client";
import Image from "./Image";
import Post from "./Post";
import { useUser } from "@clerk/nextjs";
import { useActionState, useEffect } from "react";
import { addComment } from "@/action";
import { socket } from "@/socket";
import { link } from "fs";

type CommentWithDetails = PostType & {
  user: {
    displayName: string | null;
    username: string;
    img: string | null;
  };
  _count: { likes: number; rePosts: number; comments: number };
  likes: { id: number }[];
  rePosts: { id: number }[];
  saves: { id: number }[];
};

interface CommentsProps {
  comments: CommentWithDetails[];
  postId: number;
  username: string;
}

const Comments = ({ comments, postId, username }: CommentsProps) => {
  const { user, isLoaded, isSignedIn } = useUser();

  const [state, formAction, isPending] = useActionState(
    async (state: { success: boolean; error: boolean }, formData: FormData) => {
      return await addComment(formData, state);
    },
    {
      success: false,
      error: false,
    }
  );

  useEffect(() => {
    if (state.success) {
      socket.emit("sendNotification", {
        receiverUsername: username,
        data: {
          senderUsername: user?.username,
          type: "comment",
          link: `/${username}/status/${postId}`,
        },
      });
    }
  }, [state.success, user?.username, username, postId]);

  return (
    <div className=''>
      {user && (
        <form
          action={formAction}
          className='flex items-center justify-between gap-4 p-4 '
        >
          <div className='relative w-10 h-10 rounded-full overflow-hidden -z-10'>
            <Image
              src={user?.imageUrl || ""}
              alt={user?.fullName || user?.username || "UserImage"}
              w={100}
              h={100}
              tr={true}
            />
          </div>

          <input type='number' name='postId' hidden readOnly value={postId} />

          <input
            type='string'
            name='username'
            hidden
            readOnly
            value={username}
          />

          <input
            type='text'
            name='desc'
            className='flex-1 bg-transparent outline-none p-2 text-xl'
            placeholder='Post your reply'
          />

          <button
            type='submit'
            disabled={isPending}
            className='py-2 px-4 font-bold bg-white text-black rounded-full disabled:cursor-not-allowed disabled:bg-gray-200'
          >
            {isPending ? "Replying..." : "Reply"}
          </button>
        </form>
      )}
      {state.error && (
        <span className='text-red-500 p-4'>Something went wrong!</span>
      )}

      {/* POST */}
      {comments.map((comment) => (
        <div key={comment.id}>
          <Post post={comment} type='comment' />
        </div>
      ))}
    </div>
  );
};

export default Comments;
