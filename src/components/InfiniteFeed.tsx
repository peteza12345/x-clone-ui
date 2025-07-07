"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";

const fetchPosts = async (pageParam: number, userProfileId?: string) => {
  const response = await fetch(
    "http://localhost:3000/api/posts?cursor=" +
      pageParam +
      "&user?=" +
      userProfileId
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const InfiniteFeed = ({ userProfileId }: { userProfileId?: string }) => {
  const { data, error, status, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 2 }) => fetchPosts(pageParam, userProfileId),
    initialPageParam: 2,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 2 : undefined,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (status === "pending") return <div>Loading...</div>;

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];

  return (
    <InfiniteScroll
      dataLength={allPosts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h1>Posts are Loading...</h1>}
      endMessage={<h1>All posts have been loaded</h1>}
    >
      {allPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </InfiniteScroll>
  );
};

export default InfiniteFeed;
