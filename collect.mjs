
import { fetchTrendingNow } from 'google-trends-now';
import { writeFileSync, mkdirSync } from 'node:fs';

const countries = [
  ['India', 'IN'], ['United States', 'US'],
  ['United Kingdom', 'GB'], ['Canada', 'CA'],
  ['Australia', 'AU'], ['New Zealand', 'NZ'],
  ['Ireland', 'IE'], ['Singapore', 'SG'],
  ['South Africa', 'ZA'], ['Nigeria', 'NG'],
  ['Kenya', 'KE'], ['Germany', 'DE'],
  ['France', 'FR'], ['Italy', 'IT'],
  ['Spain', 'ES'], ['Brazil', 'BR'],
  ['Mexico', 'MX'], ['Japan', 'JP'],
  ['South Korea', 'KR'], ['Indonesia', 'ID']
];

const headers = [
  'Fetched At', 'Country', 'Rank', 'Trending Search',
  'Search Volume', 'Growth %', 'Started At', 'Trend Breakdown'
];

const rows = [headers];

for (const [country, geo] of countries) {
  console.log(`Fetching ${country}...`);

  const result = await fetchTrendingNow({
    geo,
    hours: 48,
    limit: 20,
    fallback: 'none'
  });

  if (result.fetch_status !== 'success' ||
      !result.items?.length) {
    throw new Error(`${country}: trends fetch failed`);
  }

  const fetchedAt = new Date().toISOString();

  result.items.slice(0, 20).forEach((item, index) => {
    rows.push([
      fetchedAt,
      country,
      index + 1,
      item.query || '',
      item.search_volume_label || item.search_volume || '',
      item.increase_percentage ?? '',
      item.started_at || '',
      (item.trend_breakdown || []).join('; ')
    ]);
  });
}

function csvCell(value) {
  return '"' + String(value ?? '').replace(/"/g, '""') + '"';
}

const csv = rows
  .map(row => row.map(csvCell).join(','))
  .join('\r\n') + '\r\n';

mkdirSync('data', { recursive: true });
writeFileSync('data/trending.csv', csv, 'utf8');

console.log(`Finished: ${rows.length - 1} trends collected.`);
