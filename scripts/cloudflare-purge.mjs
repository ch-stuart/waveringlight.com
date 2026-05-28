const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!apiToken || !zoneId) {
  console.error('Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID must be set.');
  process.exit(1);
}

console.log('Purging Cloudflare cache...');

const response = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purge_everything: true }),
  }
);

const result = await response.json();

if (!result.success) {
  console.error('Purge failed:', JSON.stringify(result.errors, null, 2));
  process.exit(1);
}

console.log('Cache purged successfully.');
