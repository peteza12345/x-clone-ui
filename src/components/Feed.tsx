import { prisma } from "@/prisma";
import Post from "./Post";
import { auth } from "@clerk/nextjs/server";
import InfiniteFeed from "./InfiniteFeed";

const Feed = async ({ userProfileId }: { userProfileId?: string }) => {
  const { userId } = await auth();
  if (!userId) {
    return <div>Please log in to view the feed.</div>;
  }

  const whereCondition = userProfileId
    ? { parentPostId: null, userId: userProfileId }
    : {
        parentPostId: null,
        userId: {
          in: [
            userId,
            ...(
              await prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true },
              })
            ).map((follow) => follow.followingId),
          ],
        },
      };

  // Query to fetch posts
  const postIncludeQuery = {
    user: { select: { displayName: true, username: true, img: true } },
    _count: { select: { likes: true, rePosts: true, comments: true } },
    likes: { where: { userId: userId }, select: { id: true } },
    rePosts: { where: { userId: userId }, select: { id: true } },
    saves: { where: { userId: userId }, select: { id: true } },
  };

  const posts = await prisma.post.findMany({
    where: whereCondition,
    include: {
      rePost: {
        include: postIncludeQuery,
      },
      ...postIncludeQuery,
    },
    orderBy: { createdAt: "desc" },
    take: 3, // Limit the number of posts fetched
    skip: 0, // Skip for pagination
  });
  if (!posts || posts.length === 0) {
    return <div>No posts available.</div>;
  }

  return (
    <>
      {posts.map((post, index) => (
        <div key={index}>
          <Post
            post={{
              ...post,
              user: post.user!,
              rePost: post.rePost
                ? {
                    ...post.rePost,
                    user: post.rePost.user!,
                  }
                : undefined,
            }}
          />
          {/* <Post post={post} /> */}
        </div>
      ))}

      <InfiniteFeed userProfileId={userProfileId} />
    </>
  );
};

export default Feed;
