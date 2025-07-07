import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userProfileId = searchParams.get("user") || undefined;
  const page = searchParams.get("cursor");
  const LIMIT = 3; // Limit the number of posts fetched

  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // let whereCondition;
  // if (userProfileId) {
  //   whereCondition = { parentPostId: null, userId: userProfileId };
  // } else {
  //   // Get all following user IDs
  //   const following = await prisma.follow.findMany({
  //     where: { followerId: userId },
  //     select: { followingId: true },
  //   });

  //   const followingIds = following.map((f) => f.followingId);

  //   whereCondition = {
  //     parentPostId: null,
  //     userId: {
  //       in: [userId, ...followingIds],
  //     },
  //   };
  // }

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
    take: LIMIT, // Limit the number of posts fetched
    skip: (Number(page) - 1) * LIMIT, // Skip for pagination
  });
  if (!posts || posts.length === 0) {
    return new Response("No posts available", { status: 404 });
  }

  // Count the total number of posts for pagination
  const totalPosts = await prisma.post.count({
    where: whereCondition,
  });

  // Determine if there are more posts to fetch
  const hasMore = Number(page) * LIMIT < totalPosts;

  return Response.json({ posts, hasMore });
}
