import Link from "next/link";
import Image from "./Image";

const PopularTags = () => {
  return (
    <div className='p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4'>
      <h1 className='text-xl font-bold text-textGrayLight'>
        {"What's"} Happenning
      </h1>

      {/* TRENDING EVENTS */}
      <div className='flex gap-4'>
        {/* IMAGE */}
        <div className='relative size-20 rounded-xl overflow-hidden'>
          <Image
            path='general/avatar.png'
            alt='event'
            w={120}
            h={120}
            tr={true}
          />
        </div>

        {/* DESCRIPTION */}
        <div className='flex-1'>
          <h2 className='font-bold text-textGrayLight'>
            Nadal v Federer Grand Slam
          </h2>
          <span className='text-sm text-textGray'>Last Night</span>
        </div>
      </div>

      {/* TOPICS INFO */}
      <div>
        <div className='flex items-center justify-between'>
          <span className='text-textGray text-sm'>Technology • Trending</span>
          <Image path='icons/infoMore.svg' alt='info' w={16} h={16} />
        </div>
        <h2 className='text-textGrayLight font-bold'>OpenAI</h2>
        <span className='text-textGray text-sm'>20K posts</span>
      </div>

      {/* TOPICS INFO */}
      <div>
        <div className='flex items-center justify-between'>
          <span className='text-textGray text-sm'>Technology • Trending</span>
          <Image path='icons/infoMore.svg' alt='info' w={16} h={16} />
        </div>
        <h2 className='text-textGrayLight font-bold'>OpenAI</h2>
        <span className='text-textGray text-sm'>20K posts</span>
      </div>

      {/* TOPICS INFO */}
      <div>
        <div className='flex items-center justify-between'>
          <span className='text-textGray text-sm'>Technology • Trending</span>
          <Image path='icons/infoMore.svg' alt='info' w={16} h={16} />
        </div>
        <h2 className='text-textGrayLight font-bold'>OpenAI</h2>
        <span className='text-textGray text-sm'>20K posts</span>
      </div>

      {/* TOPICS INFO */}
      <div>
        <div className='flex items-center justify-between'>
          <span className='text-textGray text-sm'>Technology • Trending</span>
          <Image path='icons/infoMore.svg' alt='info' w={16} h={16} />
        </div>
        <h2 className='text-textGrayLight font-bold'>OpenAI</h2>
        <span className='text-textGray text-sm'>20K posts</span>
      </div>

      {/* SHOW MORE LINK */}
      <Link href='/' className='text-iconBlue'>
        Show More
      </Link>
    </div>
  );
};

export default PopularTags;
