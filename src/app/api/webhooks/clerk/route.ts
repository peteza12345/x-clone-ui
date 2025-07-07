import { prisma } from "@/prisma";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // const payload = await req.json();
    // const body = JSON.stringify(payload);

    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);

    if (eventType === "user.created") {
      try {
        await prisma.user.create({
          data: {
            id: evt.data.id, // Ensure id is a string
            username: evt.data.username ?? "", // Use firstName if available, fallback to empty string
            email: evt.data.email_addresses?.[0]?.email_address, // Use first email address if available
            img: evt.data.image_url || null, // Use image_url if available
            // username: JSON.parse(body).data.username,
            // email: JSON.parse(body).data.email_addresses[0].email_address,
            // img: JSON.parse(body).image_url || null, // Use image_url if available
          },
        });

        return new Response("User created successfully", {
          status: 200,
        });
      } catch (err) {
        console.error("Error processing user.created event:", err);
        return new Response("Error processing user.created event", {
          status: 500,
        });
      }
    }

    // Delete the user if the event type is user.deleted
    if (eventType === "user.deleted") {
      try {
        await prisma.user.delete({
          where: { id: evt.data.id }, // Ensure id is a string
        });

        return new Response("User deleted successfully", {
          status: 200,
        });
      } catch (err) {
        console.error("Error processing user.deleted event:", err);
        return new Response("Error processing user.deleted event", {
          status: 500,
        });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
