import snoowrap from 'snoowrap';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

console.log(`What's happening in Singapore?!?`);

const r = new snoowrap({
  userAgent: 'whathappen-sg/1.0',
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});

const results = await r.getSubreddit('singapore').search({
  query: `what's happening in`,
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
