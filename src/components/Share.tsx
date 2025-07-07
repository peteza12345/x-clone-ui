"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import NextImage from "next/image";
import Image from "./Image";
// import { shareAction } from "@/actions";
import ImageEditor from "./ImageEditor";
import { addPost } from "@/action";
import { useUser } from "@clerk/nextjs";

const Share = () => {
  const [media, setMedia] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
    sensitive: boolean;
  }>({
    type: "original",
    sensitive: false,
  });

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMedia(event.target.files[0]);
    } else {
      setMedia(null);
    }
  };

  const previewURL = media ? URL.createObjectURL(media) : null;

  const { user } = useUser();

  const [state, formAction, isPending] = useActionState(
    async (state: { success: boolean; error: boolean }, formData: FormData) => {
      return await addPost(formData, state);
    },
    {
      success: false,
      error: false,
    }
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Reset form
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setMedia(null);
      setSettings({ type: "original", sensitive: false });
    }
  }, [state.success]);

  return (
    <form
      className='p-4 flex gap-4'
      // action={(formData) => shareAction(formData, settings)}
      ref={formRef}
      action={formAction}
    >
      {/* AVATAR */}
      <div className='relative w-10 h-10 rounded-full overflow-hidden'>
        <Image
          src={user?.imageUrl || ""}
          alt='Avatar'
          w={100}
          h={100}
          tr={true}
        />
      </div>

      {/* OTHERS */}
      <div className='flex-1 flex flex-col gap-4'>
        <input
          type='text'
          name='imgType'
          value={settings.type}
          hidden
          readOnly
        />
        <input
          type='text'
          name='isSensitive'
          value={settings.sensitive ? "true" : "false"}
          hidden
          readOnly
        />
        <input
          type='text'
          name='desc'
          placeholder='What is happening?!'
          className='bg-transparent outline-none placeholder:text-textGray text-xl'
        />

        {/* PREVIEW IMAGE */}
        {media?.type.includes("image") && previewURL && (
          <div className='relative rounded-xl overflow-hidden'>
            <NextImage
              src={previewURL}
              alt=''
              width={600}
              height={600}
              className={`w-full ${
                settings.type === "original"
                  ? "h-full object-contain"
                  : settings.type === "square"
                  ? "aspect-square object-cover"
                  : "aspect-video object-cover"
              }`}
            />

            <button
              type='button'
              className='absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer'
              onClick={() => setIsEditorOpen(true)}
            >
              Edit
            </button>

            <button
              type='button'
              className='absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm'
              onClick={() => setMedia(null)}
            >
              X
            </button>
          </div>
        )}

        {/* PREVIEW VIDEO */}
        {media?.type.includes("video") && previewURL && (
          <div className='relative'>
            <video src={previewURL} controls />
            <div
              className='absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm'
              onClick={() => setMedia(null)}
            >
              X
            </div>
          </div>
        )}
        {isEditorOpen && previewURL && (
          <ImageEditor
            onClose={() => setIsEditorOpen(false)}
            previewURL={previewURL}
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {/* ACTIONS BUTTONS */}
        <div className='flex items-center justify-between gap-4 flex-wrap'>
          <div className='flex gap-4 flex-wrap'>
            <input
              type='file'
              name='file'
              onChange={handleMediaChange}
              className='hidden'
              id='file'
              accept='image/*,video/*'
            />
            <label htmlFor='file'>
              <Image
                path='icons/image.svg'
                alt=''
                w={20}
                h={20}
                className='cursor-pointer'
              />
            </label>

            <Image
              path='icons/gif.svg'
              alt=''
              w={20}
              h={20}
              className='cursor-pointer'
            />
            <Image
              path='icons/poll.svg'
              alt=''
              w={20}
              h={20}
              className='cursor-pointer'
            />
            <Image
              path='icons/emoji.svg'
              alt=''
              w={20}
              h={20}
              className='cursor-pointer'
            />
            <Image
              path='icons/schedule.svg'
              alt=''
              w={20}
              h={20}
              className='cursor-pointer'
            />
            <Image
              path='icons/location.svg'
              alt=''
              w={20}
              h={20}
              className='cursor-pointer'
            />
          </div>

          <button
            type='submit'
            className='bg-white text-black font-bold rounded-full py-2 px-4 disabled:cursor-not-allowed'
            disabled={isPending}
          >
            {isPending ? "Posting" : "Post"}
          </button>
          {state.error && (
            <span className='text-red-300 p-4'>Something went wrong!</span>
          )}
        </div>
      </div>
    </form>
  );
};

export default Share;
