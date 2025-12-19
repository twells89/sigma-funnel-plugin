# Sigma Funnel Plugin

A custom funnel chart plugin for Sigma Computing with true funnel shape (touching edges) instead of centered bars.

## Features

- **True funnel shape** - Trapezoid segments with touching edges
- **Vertical or Horizontal** orientation
- **Sharp or Smooth** edge styles
- **Multiple color schemes** - Blue, Green, Purple, Orange gradients or Multi-color
- **Conversion rates** - Shows drop-off percentage between stages
- **Interactive tooltips** - Hover for detailed information
- **Responsive** - Adapts to container size

## Installation

### Option 1: Use hosted version
Register the plugin in Sigma with URL:
```
https://YOUR_GITHUB_USERNAME.github.io/sigma-funnel-plugin/
```

### Option 2: Self-host

1. Install dependencies:
```bash
npm install
```

2. Build for production:
```bash
npm run build
```

3. Copy built files to root for GitHub Pages:
```bash
cp dist/index.html .
cp -r dist/assets .
```

4. Push to GitHub and enable GitHub Pages on the main branch.

## Configuration Options

| Option | Description |
|--------|-------------|
| Data Source | Select a table or element with your funnel data |
| Stage/Category Column | Column containing stage names (e.g., "Leads", "Qualified", "Won") |
| Value Column | Column containing numeric values for each stage |
| Direction | Vertical (top-to-bottom) or Horizontal (left-to-right) |
| Style | Sharp (straight edges) or Smooth (curved edges) |
| Color Scheme | Choose from gradient or multi-color options |
| Show Values | Display the numeric value for each stage |
| Show Percentages | Display percentage relative to first stage |
| Show Conversion | Display conversion rate between stages |
| Value Format | Auto, Integer, Currency, Thousands (K), Millions (M) |

## Data Format

Your data should have at least two columns:
- A category/stage column (text)
- A value column (numeric)

Example:
| Stage | Count |
|-------|-------|
| Visitors | 10000 |
| Sign-ups | 3500 |
| Trial | 1200 |
| Paid | 400 |

The plugin will automatically:
- Aggregate duplicate categories
- Sort by value (largest first)
- Calculate percentages and conversion rates

## Development

Run locally:
```bash
npm run dev
```

Then use Sigma's Plugin Dev Playground pointing to `http://localhost:3000`

## License

MIT
