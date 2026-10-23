interface GogGame {
  id: string;
  title: string;
  slug: string;
  url: string;
}

interface GogGameDetails {
  id: string;
  title: string;
  productType: string;
  storeUrl: string | null;
  isAvailableForSale: boolean;
}

type GogApiMessageResponse =
  | {
      ok: true;
      game: GogGameDetails;
    }
  | {
      ok: false;
      error: string;
    };

interface PanelElements {
  panel: HTMLDivElement;
  pageTitle: HTMLParagraphElement;
  status: HTMLParagraphElement;
  details: HTMLDivElement;
}

function getGogProductId(): string | null {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  );

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? "");

      if (
        data["@type"] === "Product" &&
        typeof data.sku === "string"
      ) {
        return data.sku;
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  return null;
}

function getCurrentGame(): GogGame | null {
  const match = window.location.pathname.match(
    /^\/[a-z]{2}\/game\/([^/]+)/,
  );

  if (!match) {
    return null;
  }

  const slug = match[1];
  const productId = getGogProductId() ?? "";

  return {
    id: productId,
    title: document.title,
    slug: slug,
    url: window.location.href,
  };
}

function createPanel(): PanelElements {
  const panel = document.createElement("div");
  panel.id = "gog-enhancer-panel";
  panel.setAttribute("aria-live", "polite");

  panel.style.cssText = [
    "position:fixed",
    "top:16px",
    "right:16px",
    "z-index:2147483647",
    "width:320px",
    "max-width:calc(100vw - 32px)",
    "box-sizing:border-box",
    "padding:16px",
    "background:#ffffff",
    "color:#202020",
    "border:1px solid #b8b8b8",
    "border-radius:8px",
    "box-shadow:0 4px 18px rgba(0,0,0,0.2)",
    "font:14px/1.5 system-ui,sans-serif",
  ].join(";");

  const heading = document.createElement("h2");
  heading.textContent = "GOG Enhancer";
  heading.style.cssText =
    "margin:0 0 8px;font-size:18px;color:#202020;";

  const pageTitle = document.createElement("p");
  pageTitle.textContent = document.title;
  pageTitle.style.cssText = "margin:0 0 8px;font-weight:600;";

  const status = document.createElement("p");
  status.textContent = "Preparing to load game details...";
  status.style.cssText = "margin:0 0 8px;";

  const details = document.createElement("div");

  panel.appendChild(heading);
  panel.appendChild(pageTitle);
  panel.appendChild(status);
  panel.appendChild(details);

  return {
    panel: panel,
    pageTitle: pageTitle,
    status: status,
    details: details,
  };
}

function addDetail(
  container: HTMLDivElement,
  label: string,
  value: string,
): void {
  const line = document.createElement("p");
  line.style.cssText = "margin:4px 0;";
  line.textContent = `${label}: ${value}`;
  container.appendChild(line);
}

function renderGameDetails(
  elements: PanelElements,
  game: GogGameDetails,
): void {
  elements.pageTitle.textContent = game.title;
  elements.status.textContent = "Game details loaded successfully.";
  elements.details.replaceChildren();

  addDetail(elements.details, "Product ID", game.id);
  addDetail(elements.details, "Product type", game.productType);
  addDetail(
    elements.details,
    "Available for sale",
    game.isAvailableForSale ? "Yes" : "No",
  );

  if (game.storeUrl !== null) {
    const link = document.createElement("a");
    link.href = game.storeUrl;
    link.textContent = "Open this game on GOG";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.cssText =
      "display:inline-block;margin-top:8px;color:#0645ad;";

    elements.details.appendChild(link);
  }

  console.info("GOG Enhancer: game details rendered", game);
}

async function loadGameDetails(
  elements: PanelElements,
  game: GogGame,
): Promise<void> {
  if (!game.id) {
    elements.status.textContent =
      "Could not extract a GOG product ID from this page.";

    console.warn(
      "GOG Enhancer: no product ID found",
      window.location.href,
    );

    return;
  }

  elements.status.textContent =
    `Loading product ${game.id} from GOG...`;

  console.info("GOG Enhancer: detected game page", game);

  try {
    const response: GogApiMessageResponse =
      await browser.runtime.sendMessage({
        type: "GOG_GET_GAME",
        id: game.id,
      });

    if (!response || typeof response !== "object") {
      throw new Error(
        "The background script returned no valid response.",
      );
    }

    if (!response.ok) {
      throw new Error(response.error);
    }

    renderGameDetails(elements, response.game);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";

    elements.status.textContent =
      `Could not load game details: ${message}`;

    console.error("GOG Enhancer: failed to load game", {
      productId: game.id,
      error: message,
    });
  }
}

const game = getCurrentGame();

if (game === null) {
  console.info("GOG Enhancer: not a game page");
} else {
  const elements = createPanel();

  document.body.appendChild(elements.panel);

  void loadGameDetails(elements, game);
}