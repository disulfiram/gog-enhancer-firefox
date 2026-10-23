import { GogApiClient } from "./services/gogApi.js";
import type { GogGameDetails } from "./models/gogGame.js";

interface GogGameRequest {
  type: "GOG_GET_GAME";
  id: string;
}

type GogGameMessageResponse =
  | {
      ok: true;
      game: GogGameDetails;
    }
  | {
      ok: false;
      error: string;
    };

const gogApiClient = new GogApiClient();

function handleMessage(
  message: unknown,
): Promise<GogGameMessageResponse> | undefined {
  if (typeof message !== "object" || message === null) {
    return undefined;
  }

  const candidate = message as {
    type?: unknown;
    id?: unknown;
  };

  if (candidate.type !== "GOG_GET_GAME") {
    return undefined;
  }

  if (typeof candidate.id !== "string") {
    return Promise.resolve({
      ok: false,
      error: "The GOG product ID must be a string.",
    });
  }

  const request: GogGameRequest = {
    type: "GOG_GET_GAME",
    id: candidate.id,
  };

  return loadGame(request.id);
}

async function loadGame(
  id: string,
): Promise<GogGameMessageResponse> {
  console.info("GOG Enhancer: requesting product", id);

  try {
    const game = await gogApiClient.getGame(id);

    console.info("GOG Enhancer: product received", game);

    return {
      ok: true,
      game: game,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";

    console.error("GOG Enhancer: API request failed", message);

    return {
      ok: false,
      error: message,
    };
  }
}

browser.runtime.onMessage.addListener(handleMessage);

console.info("GOG Enhancer: background script loaded");