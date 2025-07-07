import Link from "next/link";
import Image from "./Image";
import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";

const Recommendations = async () => {
  const { userId } = await auth();
  if (!userId) {
    return;
  }

  const followinhIds = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingUserIds = followinhIds.map((follow) => follow.followingId);

  const friendRecommendations = await prisma.user.findMany({
    where: {
      id: { not: userId, notIn: followingUserIds }, // Exclude current user and already followed users
      // Optionally, you can add more conditions to filter recommendations
      followings: { some: { followerId: { in: followingUserIds } } }, // Users who are followed by the user's followings
    },
    take: 3, // Limit to 3 recommendations
    select: { id: true, username: true, displayName: true, img: true },
  });

  return (
    <div className='p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4'>
      {friendRecommendations.map((person) => (
        <div className='flex items-center justify-between' key={person.id}>
          {/* USER CARD */}
          <div className='flex items-center gap-2'>
            {/* USER IMAGE */}
            <div className='relative rounded-full overflow-hidden w-10 h-10'>
              <Image
                path={person.img || "general/avatar.png"}
                alt={person.username}
                w={100}
                h={100}
                tr={true}
              />
            </div>

            {/* USER INFO */}
            <div>
              <h1 className='text-md font-bold'>
                {person.displayName || person.username}
              </h1>
              <span className='text-textGray text-sm'>@{person.username}</span>
            </div>
          </div>

          {/* FOLLOW BUTTON */}
          <button
            type='button'
            className='py-1 px-4 font-semibold bg-white text-black rounded-full'
          >
            Follow
          </button>
        </div>
      ))}

      {/* SEPARATOR */}

      {/* LINK */}
      <Link href='/' className='text-iconBlue'>
        Show More
      </Link>
    </div>
  );
};

export default Recommendations;
