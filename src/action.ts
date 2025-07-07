"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { imagekit } from "./utils";

// Follow User
export async function followUser(targetUserId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if the Follow already exists
  const existingFollow = await prisma.follow.findFirst({
    where: { followerId: userId, followingId: targetUserId },
  });

  if (existingFollow) {
    // If it exists, delete the Follow
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
  } else {
    // If it doesn't exist, create a new Follow
    await prisma.follow.create({
      data: { followerId: userId, followingId: targetUserId },
    });
  }
}

// Like Post
export async function likePost(postId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if the like already exists
  const existingLike = await prisma.like.findFirst({
    where: { postId, userId },
  });
  // console.log(`User ID: ${userId}, Post ID: ${postId}`);

  if (existingLike) {
    // If it exists, delete the like
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    // If it doesn't exist, create a new like
    await prisma.like.create({
      data: { postId, userId },
    });
  }
}

// Repost
export async function rePost(postId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if the repost already exists
  const existingRepost = await prisma.post.findFirst({
    where: { userId, rePostId: postId },
  });
  // console.log(`User ID: ${userId}, Post ID: ${postId}`);

  if (existingRepost) {
    // If it exists, delete the repost
    await prisma.post.delete({
      where: { id: existingRepost.id },
    });
  } else {
    // If it doesn't exist, create a new repost
    await prisma.post.create({
      data: { userId, rePostId: postId },
    });
  }
}

// Save Post
export async function savePost(postId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Check if the like already exists
  const existingSavepost = await prisma.savedPosts.findFirst({
    where: { postId, userId },
  });
  // console.log(`User ID: ${userId}, Post ID: ${postId}`);

  if (existingSavepost) {
    // If it exists, delete the like
    await prisma.savedPosts.delete({
      where: { id: existingSavepost.id },
    });
  } else {
    // If it doesn't exist, create a new like
    await prisma.savedPosts.create({
      data: { postId, userId },
    });
  }
}

// Add Comment
export async function addComment(
  formData: FormData,
  prevState: { success: boolean; error: boolean }
) {
  const { userId } = await auth();
  if (!userId) {
    return {
      ...prevState,
      error: true,
      success: false,
    };
  }

  const postId = formData.get("postId");
  const username = formData.get("username");
  const desc = formData.get("desc");

  const commentSchema = z.object({
    parentPostId: z.number(),
    desc: z
      .string()
      .min(1, "Comment cannot be empty")
      .max(280, "Comment cannot exceed 280 characters"),
  });

  // Validate the form data
  const ValidatedFields = commentSchema.safeParse({
    parentPostId: Number(postId),
    desc,
  });
  if (!ValidatedFields.success) {
    return {
      ...prevState,
      error: true,
      success: false,
    };
  }

  try {
    await prisma.post.create({
      data: {
        parentPostId: ValidatedFields.data.parentPostId,
        desc: ValidatedFields.data.desc,
        userId: userId,
      },
    });

    // Revalidate the page
    revalidatePath(`/${username}/status/${postId}`);

    return {
      ...prevState,
      error: false,
      success: true,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      ...prevState,
      error: true,
      success: false,
    };
  }
}

// Add Post
export async function addPost(
  formData: FormData,
  prevState: { success: boolean; error: boolean }
) {
  const { userId } = await auth();
  if (!userId) {
    return {
      ...prevState,
      error: true,
      success: false,
    };
  }

  const desc = formData.get("desc");
  const file = formData.get("file") as File | null;
  const isSensitive = formData.get("isSensitive") as string | null;
  const imgType = formData.get("imgType") as string | null;

  // Upload the file to ImageKit
  const uploadFile = async (file: File): Promise<UploadResponse> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const transformation = `w-600,${
      imgType === "square" ? "ar-1-1" : imgType === "wide" ? "ar-16-9" : ""
    }`;

    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer,
          fileName: file.name,
          folder: "/posts",
          ...(file.type.includes("image") && {
            transformation: {
              pre: transformation,
            },
          }),
        },
        function (error, result) {
          if (error) reject(error);
          else resolve(result as UploadResponse);
        }
      );
    });
  };

  const postSchema = z.object({
    desc: z
      .string()
      .min(1, "Post cannot be empty")
      .max(280, "Post cannot exceed 280 characters"),
    isSensitive: z.boolean().optional(),
  });

  // Validate the form data
  const validatedFields = postSchema.safeParse({
    desc,
    isSensitive: isSensitive === "true" ? true : false,
  });
  if (!validatedFields.success) {
    console.error(
      "Error adding post:",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      ...prevState,
      error: true,
      success: false,
    };
  }

  let img = "";
  let imgHeight = 0;
  let video = "";

  if (file?.size) {
    const result: UploadResponse = await uploadFile(file);

    if (result.fileType === "image") {
      img = result.filePath;
      imgHeight = result.height;
    } else {
      video = result.filePath;
    }
  }

  try {
    await prisma.post.create({
      data: {
        ...validatedFields.data,
        userId,
        img,
        imgHeight,
        video,
      },
    });

    revalidatePath("/");
    return {
      ...prevState,
      error: false,
      success: true,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      ...prevState,
      error: true,
      success: false,
    };
  }
}
