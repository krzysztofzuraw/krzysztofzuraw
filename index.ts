import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const ResponseSchema = z
  .array(
    z.object({
      title: z.string(),
      url: z.string().url(),
    })
  )
  .nonempty();

const response = await fetch("https://krzysztofzuraw.com/blog.json");
const blogPosts = ResponseSchema.parse(await response.json());

const markdownPosts = blogPosts
  .map(({ title, url }) => `- [${title}](${url})`)
  .join("\n");

const openTag = `<!-- FEED-START -->`;
const closeTag = `<!-- FEED-END -->`;
const filePath = "./README.md";

const readme = await Deno.readTextFile(filePath);
const indexBefore = readme.indexOf(openTag) + openTag.length;
const indexAfter = readme.indexOf(closeTag);
const readmeContentChunkBreakBefore = readme.substring(0, indexBefore);
const readmeContentChunkBreakAfter = readme.substring(indexAfter);

const readmeNew = `${readmeContentChunkBreakBefore}\n${markdownPosts}\n${readmeContentChunkBreakAfter}`;

await Deno.writeTextFile(filePath, readmeNew);

console.log("Readme updated! 🎉");
