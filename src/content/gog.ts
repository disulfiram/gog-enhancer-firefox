interface GogGame {
    id: string;
    title: string;
    slug: string;
    url: string;
}

function getCurrentGame(): GogGame | null {
    const match = window.location.pathname.match(
        /^\/[a-z]{2}\/game\/([^/]+)/
    );

    if (!match) {
        return null;
    }

    const slug = match[1];

    return {
        id: "",
        title: document.title,
        slug,
        url: window.location.href
    };
}

const game = getCurrentGame();

if (game) {
    console.log("GOG Enhancer: detected game", game);
} else {
    console.log("GOG Enhancer: not a game page");
}