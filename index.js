// Based on: https://pawelgrzybek.com/fetch-most-recent-posts-to-your-github-profile-page-using-github-workflow-and-node-js/
import axios from "axios";
import fs from "fs";
import parser from "xml2json";

const FEED_URL = "https://krzysztofzuraw.com/feeds/all.xml";
const TAG_OPEN = `<!-- FEED-START -->`;
const TAG_CLOSE = `<!-- FEED-END -->`;

const fetchPosts = async () => {
  const response = await axios.get(FEED_URL);
  const XMLResponse = parser.toJson(response.data);
  const JSONResponse = JSON.parse(XMLResponse);

  const latestPosts = JSONResponse.feed.entry.slice(0, 3);
  return latestPosts
    .map(({ title, link }) => `- [${title}](${link.href})`)
    .join("\n");
};

const main = async () => {
  const readme = fs.readFileSync("./README.md", "utf8");
  const indexBefore = readme.indexOf(TAG_OPEN) + TAG_OPEN.length;
  const indexAfter = readme.indexOf(TAG_CLOSE);
  const readmeContentChunkBreakBefore = readme.substring(0, indexBefore);
  const readmeContentChunkBreakAfter = readme.substring(indexAfter);

  const posts = await fetchPosts();

  const readmeNew = `
${readmeContentChunkBreakBefore}
${posts}
${readmeContentChunkBreakAfter}
`;

  fs.writeFileSync("./README.md", readmeNew.trim());
};

try {
  main();
} catch (error) {
  console.error(error);
}
