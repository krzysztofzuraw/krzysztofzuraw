// Based on: https://pawelgrzybek.com/fetch-most-recent-posts-to-your-github-profile-page-using-github-workflow-and-node-js/
import axios from "axios";
import parser from "xml2json";
import fs from "fs";

const FEED_URL = "https://krzysztofzuraw.com/feed.xml";
const TAG_OPEN = `<!-- FEED-START -->`;
const TAG_CLOSE = `<!-- FEED-END -->`;

type JSONResponse = {
  rss: {
    channel: {
      item: Array<{
        title: string;
        link: string;
      }>;
    };
  };
};

const fetchPosts = async () => {
  const response = await axios.get<string>(FEED_URL);
  const XMLResponse = parser.toJson(response.data);
  const JSONResponse: JSONResponse = JSON.parse(XMLResponse);

  const lastestPosts = JSONResponse.rss.channel.item.slice(0, 5);
  return lastestPosts
    .map(({ title, link }) => `- [${title}](${link})`)
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
