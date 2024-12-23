import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  try {
    const posts = await getCollection("blog");

    const searchIndex = posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      slug: post.slug,
    }));

    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Failed to generate search index:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load search index" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
