import dotenv from 'dotenv';
dotenv.config();

import snoowrap from 'snoowrap';
import fs from 'fs';
import { parse } from 'marked';
import { Feed } from 'feed';

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

console.log(`What's happening in Singapore?!?`);

const r = new snoowrap({
  userAgent: 'whathappen-sg/1.0',
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});

const results = await r.getSubreddit('singapore').search({
  query: `what's happening flair:news`,
  time: 'month',
  sort: 'relevance',
});

const happeningResult = results.find((result) =>
  result.title.toLowerCase().includes('happening'),
);

if (!happeningResult) {
  throw new Error('No happenings found');
}

fs.writeFileSync('happenings.md', happeningResult.selftext);
console.log('happenings.md written');

const html = parse(happeningResult.selftext);
fs.writeFileSync('happenings.html', html);
console.log('happenings.html written');

const feed = new Feed({
  title: 'What Happen SG',
  description:
    'Latest "What\'s Happening in MONTH YEAR" thread content from /r/singapore subreddit.',
  id: 'https://cheeaun.github.io/whathappen-sg/',
  link: 'https://cheeaun.github.io/whathappen-sg/',
  language: 'en',
  generator: 'cheeaun/whathappen-sg',
});
feed.addItem({
  title: happeningResult.title,
  id: happeningResult.url,
  link: happeningResult.url,
  content: html,
  date: new Date(),
  author: [
    {
      name: 'whathappen-sg',
    },
  ],
});
fs.writeFileSync('feed.rss', feed.rss2());
fs.writeFileSync('feed.atom', feed.atom1());
fs.writeFileSync('feed.json', feed.json1());
console.log('feed.* files written');

const text = `## ${happeningResult.title} ([thread](${happeningResult.url}))

${happeningResult.selftext.replace(/\B# /g, '### ')}`;

const readmeContent = fs
  .readFileSync('README.md', 'utf8')
  .replace(
    /<!-- START HAPPENING -->.*<!-- END HAPPENING -->/s,
    `<!-- START HAPPENING -->\n${text}\n<!-- END HAPPENING -->`,
  );
fs.writeFileSync('README.md', readmeContent);
console.log('README.md written');
