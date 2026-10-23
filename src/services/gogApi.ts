import type { GogGameDetails } from "../models/gogGame.js";

interface GogGameApiResponse {
  productType?: unknown;
  _links?: {
    store?: {
      href?: unknown;
    };
  };
  _embedded?: {
    product?: {
      id?: unknown;
      title?: unknown;
      category?: unknown;
      isAvailableForSale?: unknown;
    };
  };
}

export class GogApiClient {
  private readonly baseUrl = "https://api.gog.com/v2/games";

  async getGame(id: string): Promise<GogGameDetails> {
    if (!/^\d+$/.test(id)) {
      throw new Error("Invalid GOG product ID.");
    }

    const url = new URL(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
    );
    url.searchParams.set("locale", "en-US");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `GOG API request failed: ${response.status}`,
      );
    }

    const data: GogGameApiResponse = await response.json();
    const product = data._embedded?.product;

    if (!product) {
      throw new Error(
        "GOG API response has no _embedded.product.",
      );
    }

    if (String(product.id) !== id) {
      throw new Error(
        `GOG API product ID mismatch. Expected ${id}, received ${String(product.id)}.`,
      );
    }

    if (typeof product.title !== "string") {
      throw new Error("GOG API product title is missing.");
    }

    const productType =
      typeof data.productType === "string"
        ? data.productType
        : product.category;

    if (typeof productType !== "string") {
      throw new Error(
        "GOG API response has no valid productType or product category.",
      );
    }

    const storeHref = data._links?.store?.href;
    let storeUrl: string | null = null;

    if (typeof storeHref === "string") {
      try {
        const parsedUrl = new URL(storeHref);

        if (
          parsedUrl.protocol === "https:" &&
          parsedUrl.hostname === "www.gog.com"
        ) {
          storeUrl = parsedUrl.href;
        }
      } catch {
        // Ignore an invalid store URL.
      }
    }

    return {
      id: String(product.id),
      title: product.title,
      productType: productType,
      storeUrl: storeUrl,
      isAvailableForSale:
        product.isAvailableForSale === true,
    };
  }
}