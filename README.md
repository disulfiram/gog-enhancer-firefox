# GOG Enhancer

A Firefox extension that enhances the GOG store with useful game information,
price history, external integrations, and personal game filtering.

## Status

🚧 Early development

The extension currently detects GOG game pages and extracts:

- Game title
- URL
- URL slug
- GOG product ID - coming next

## V1.0 Goals

### GOG game information

- Detect GOG game/product pages
- Identify games using a stable GOG product ID
- Show useful information directly on GOG game pages
- Keep the extension's UI simple and unobtrusive

### Price information

- Show current GOG price
- Show historical price information
- Show historical low
- Link to IsThereAnyDeal
- Cache information where appropriate to avoid unnecessary requests

### External integrations

V1.0:

- [IsThereAnyDeal](https://isthereanydeal.com/)
  - Price information
  - Historical prices
  - Store/deal information
- [PCGamingWiki](https://www.pcgamingwiki.com/)
  - Direct game-page links
  - Additional game information where practical

Future:

- HowLongToBeat
- ProtonDB
- Other useful game-related services

### Ignore games

Games can be ignored so they can be hidden from GOG store listings.

Ignoring a game will support a reason/category:

- Owned elsewhere
- Not interested
- Different version owned on GOG
- Other / future reasons

The ignore system should be designed so new ignore reasons can be added easily without redesigning the feature.

Ignored games should:

- Be hidden from relevant GOG store lists where possible
- Show a clear visual indication when their individual page is opened
- Provide an easy way to remove the ignore status
- Preserve the selected ignore reason

### Game packages / bundles

Some GOG pages contain packages with multiple games listed as links.

V1.0 goal:

- Detect games included in packages where practical
- Visually strike through included games that have been ignored

Future:

- Mark included games that are already owned
- Mark included games that are wishlisted
- Provide useful status indicators for each included game

## Price Alerts

The long-term goal is to let users set a target price for a game.

Example:

- Current price: €19.99
- Target price: €9.99
- Notify me when the price is €9.99 or lower

Initial design:

- Price checks can happen when the user loads/reloads GOG
- Checks should run asynchronously
- Multiple tracked games should be checked without blocking the GOG UI
- Avoid unnecessary API requests through caching and sensible check intervals
- Use Firefox notifications when a target price is reached

A server-side price monitoring system is **not currently required** by the project requirements.

## Data & Sync

User data should primarily remain local to the extension.

Data may include:

- Ignored games and ignore reasons
- Price alerts
- Game/service ID mappings
- Extension settings
- Cached information

V1.0 sync/export goal:

- Export extension data to a JSON file
- Import extension data from a JSON file
- Make moving data between Firefox installations/browsers simple

Future:

- Investigate Firefox/cloud-based synchronization if it can be implemented easily and reliably

## Architecture

The extension is planned around:

- TypeScript
- Firefox WebExtension APIs
- Manifest V3
- `web-ext` for development/building
- Local extension storage
- Small, focused service integrations

High-level structure:

```text
GOG page
   |
   v
Content script
   |
   +-- Game detection
   +-- Page UI
   +-- Ignore/list filtering
   |
   v
Extension background logic
   |
   +-- GOG
   +-- IsThereAnyDeal
   +-- PCGamingWiki
   +-- Notifications
   +-- Storage
```

Integrations should be kept separate from the core extension so additional services can be added without rewriting existing functionality.

## Development

Requirements:

- Windows / macOS / Linux
- Node.js LTS
- VSCodium or another suitable editor
- Git

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run the extension in Firefox:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

## Roadmap

### Phase 0 - GOG reconnaissance

- [x] Create project repository
- [x] Set up TypeScript
- [x] Set up `web-ext`
- [x] Load extension in Firefox
- [x] Detect GOG game pages
- [ ] Extract stable GOG product ID
- [ ] Investigate GOG product API

### Phase 1 - Core game model

- [ ] Create GOG game model
- [ ] Create storage abstraction
- [ ] Establish game/service ID mapping
- [ ] Add basic extension UI

### Phase 2 - Ignore system

- [ ] Add Ignore button
- [ ] Add configurable ignore reasons
- [ ] Store ignored games locally
- [ ] Hide ignored games from store lists
- [ ] Visually mark ignored game pages
- [ ] Handle ignored games inside packages

### Phase 3 - Price information

- [ ] Connect IsThereAnyDeal
- [ ] Identify corresponding ITAD games
- [ ] Display current price information
- [ ] Display historical low
- [ ] Display price history
- [ ] Add ITAD links

### Phase 4 - PCGamingWiki

- [ ] Identify corresponding PCGamingWiki pages
- [ ] Add PCGamingWiki links
- [ ] Investigate useful data that can be shown directly on GOG

### Phase 5 - Settings & data portability

- [ ] Add options page
- [ ] Configure visible integrations
- [ ] Export data to JSON
- [ ] Import data from JSON
- [ ] Validate imported data

### Phase 6 - Price alerts

- [ ] Add target prices
- [ ] Implement asynchronous price checks
- [ ] Avoid excessive API requests
- [ ] Add Firefox notifications
- [ ] Handle repeated notifications sensibly

### Phase 7 - Endgame features

- [ ] HowLongToBeat integration
- [ ] ProtonDB integration
- [ ] Owned-game detection
- [ ] Wishlist detection
- [ ] Owned/wishlist indicators in GOG packages
- [ ] Improved package/bundle handling
- [ ] Additional useful integrations

## Design Principles

- **Absolutely no data collection**

  - The extension will not collect, sell, transmit, or otherwise monetize user data.
  - User data will remain local to the user's browser whenever practical.
  - The extension will do exactly what it says it does, and nothing more.

- **Security first**

  - Avoid introducing unnecessary security risks or vulnerabilities.
  - Minimize permissions requested by the extension.
  - Minimize external communication.
  - Treat all external data as untrusted input.
  - Avoid unnecessary dependencies and third-party code.
  - Security and privacy take priority over convenience.

- **Official APIs only**

  - External services will be integrated through their official APIs whenever an API is available.
  - API usage must respect the service's documented requirements and limitations.
  - We will not reverse-engineer undocumented APIs merely because they are convenient.

- **Scraping is a last resort**

  - Scraping will not be used when an appropriate official API exists.
  - If a non-core feature requires scraping, the feature should preferably be dropped.
  - If scraping is considered sufficiently valuable to keep, it must be optional and **disabled by default**.
  - Scraping should never become a hidden or unavoidable dependency of the core extension.

- Keep the extension lightweight.

- Keep external integrations isolated.

- Don't require a server unless there is a clear need.

- Make new integrations easy to add.

- Make ignore reasons easy to extend.

- Avoid unnecessary dependencies.

- Prefer simple solutions over clever ones.

- Don't block GOG page loading on external services.

## Disclaimer

GOG Enhancer is an independent community project.

It is not affiliated with GOG.com, CD PROJEKT, IsThereAnyDeal,
PCGamingWiki, or any other integrated service.