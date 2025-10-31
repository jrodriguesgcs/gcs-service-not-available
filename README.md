# ActiveCampaign Lost Deals Dashboard

A Next.js application for analyzing lost deals from ActiveCampaign, specifically tracking deals marked as "Out of Scope" by country and program.

## Features

- **Real-time Progress Tracking**: Watch as the app fetches and processes deal data
- **Smart Caching**: Results cached for 5 minutes to reduce API calls
- **Rate Limiting**: Respects ActiveCampaign API limits (10 req/sec)
- **Concurrent Processing**: Uses 20 parallel workers for optimal performance
- **Interactive Table**: Search, sort, and filter results
- **Last 30 Days**: Automatically filters deals from the past month

## Prerequisites

- Node.js 18+ or compatible runtime
- ActiveCampaign account with API access
- Custom fields configured:
  - Field ID 60: Out-of-scope Country (select field)
  - Field ID 61: Out-of-scope Program (select field)

## Setup

1. **Clone and install dependencies:**
```bash
cd activecampaign-lost-deals
npm install
# or
pnpm install
# or
yarn install
```

2. **Configure environment variables:**

Create a `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```
ACTIVECAMPAIGN_URL=https://youraccountname.api-us1.com
ACTIVECAMPAIGN_API_KEY=your_api_key_here
```

3. **Run the development server:**
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. Click "Load Data" to fetch and analyze lost deals
2. Monitor the progress bar as data is processed
3. View results in the interactive table
4. Use search to filter by country or program
5. Click column headers to sort results
6. Click "Force Refresh" to bypass cache and reload data

## Architecture

### Data Pipeline

The application uses a three-stage data pipeline:

1. **Fetch Deals**: Retrieves all lost deals (status=2) from the last 30 days
2. **Fetch Custom Fields**: Gets country and program values for each deal (20 parallel workers)
3. **Aggregate**: Counts occurrences of each (Country | Program) combination

### Rate Limiting

- Maximum 10 requests per second to ActiveCampaign API
- 20 concurrent requests processing deals in parallel
- Exponential backoff on 429/5xx errors
- Request jitter to prevent thundering herd

### Caching

- Results cached in memory for 5 minutes
- Automatic cache invalidation after TTL expires
- "Force Refresh" bypasses cache

## Project Structure
```
activecampaign-lost-deals/
├── app/
│   ├── api/
│   │   ├── load/         # Start data pipeline
│   │   ├── progress/     # Poll job progress
│   │   └── result/       # Get final results
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main UI
├── lib/
│   ├── acClient.ts       # API client with rate limiting
│   ├── deals.ts          # Deal fetching logic
│   ├── customFields.ts   # Custom field operations
│   ├── aggregate.ts      # Data aggregation
│   ├── cache.ts          # In-memory cache
│   └── rateLimiter.ts    # Rate limiting
├── components/
│   ├── Toolbar.tsx       # Action buttons
│   ├── ProgressPanel.tsx # Progress display
│   └── ResultsTable.tsx  # Results table
└── tests/
    ├── aggregate.test.ts
    └── rateLimiter.test.ts
```

## API Endpoints

### `GET /api/load`

Starts the data pipeline and returns a job ID.

**Query Parameters:**
- `bypassCache=1` - Skip cache and force fresh data

**Response:**
```json
{
  "jobId": "job-1234567890-abc123"
}
```

### `GET /api/progress?id={jobId}`

Polls the progress of a running job.

**Response:**
```json
{
  "status": "in_progress",
  "stage": "Fetching custom field data",
  "currentStep": 2,
  "totalSteps": 3,
  "dealsProcessed": 45,
  "totalDeals": 100
}
```

### `GET /api/result?id={jobId}`

Retrieves the final aggregated results.

**Response:**
```json
{
  "results": [
    {
      "country": "Portugal",
      "program": "Golden Visa",
      "count": 25
    }
  ]
}
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

## Troubleshooting

### API Rate Limit Errors

If you see 429 errors:
- Verify your ActiveCampaign plan supports 10 req/sec
- Check if other integrations are using the API
- The app will automatically retry with exponential backoff

### Missing Custom Fields

Ensure custom fields 60 and 61 exist in your ActiveCampaign account:
1. Go to Settings > Custom Fields > Deals
2. Verify field IDs match (60 and 61)
3. Ensure both are select/dropdown fields with options

### Cache Issues

If data seems stale:
- Use "Force Refresh" button to bypass cache
- Cache automatically expires after 5 minutes
- Restart the server to clear all cache

## License

MIT