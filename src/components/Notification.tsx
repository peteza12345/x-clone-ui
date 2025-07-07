"use client";

import { useEffect, useState } from "react";
import Image from "./Image";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";

type NotificationType = {
  id: string;
  senderUsername: string;
  type: "like" | "comment" | "rePost" | "follow";
  link: string;
};

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    socket.on("getNotification", (data: NotificationType) => {
      setNotifications((prev) => [...prev, data]);
    });
  }, []);

  const reSet = () => {
    setNotifications([]);
    setOpen(false);
  };

  const handleClick = (notification: NotificationType) => {
    const filteredList = notifications.filter((n) => n.id !== notification.id);

    setNotifications(filteredList);
    setOpen(false);
    router.push(notification.link);
  };

  return (
    <div className='relative'>
      <div
        className='p-2 rounded-full hover:bg-[#181818] flex items-center gap-4'
        onClick={() => setOpen(!open)}
      >
        <div className='relative'>
          <Image
            path={`icons/notification.svg`}
            alt='Notification'
            w={24}
            h={24}
          />

          {notifications.length > 0 && (
            <div className='absolute -top-4 -right-4 w-6 h-6 bg-iconBlue p-2 rounded-full flex items-center justify-center text-sm'>
              {notifications.length}
            </div>
          )}
        </div>

        <span className='hidden xxl:inline'>Notifications</span>
      </div>

      {/* Open Notification */}
      {open && (
        <div className='absolute -right-full p-4 rounded-lg bg-white text-black flex flex-col items-center gap-4 w-max'>
          <h1 className='text-xl text-textGray'>Notification</h1>

          {notifications.map((n) => (
            <div
              className='cursor-pointer'
              key={n.id}
              onClick={() => handleClick(n)}
            >
              <b>{n.senderUsername}</b>{" "}
              <span>
                {/* {n.type === "like" && "liked your post."}
                {n.type === "comment" && "replied your post."}
                {n.type === "rePost" && "repost your post."}
                {n.type === "follow" && "followed you."} */}
                {n.type === "like"
                  ? "liked your post"
                  : n.type === "rePost"
                  ? "re-posted your post"
                  : n.type === "comment"
                  ? "replied your post"
                  : "followed you"}
              </span>
            </div>
          ))}

          <button
            type='button'
            onClick={reSet}
            className='bg-black text-white p-2 text-sm rounded-lg'
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;
