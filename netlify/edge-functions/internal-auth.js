// Login in front of /internal/ (the photo inventory, tools/photo-inventory.js).
// The browser asks for a username and password; they are compared with the
// INTERNAL_USER and INTERNAL_PASSWORD environment variables set in the Netlify
// dashboard (Site configuration → Environment variables). If either is missing
// the pages stay closed rather than open.

const REALM = 'Basic realm="DFMG internal", charset="UTF-8"';

// Compare without stopping at the first different character, so the time a
// wrong guess takes says nothing about how close it was.
async function same(a, b) {
    const enc = new TextEncoder();
    const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest("SHA-256", enc.encode(s))));
    const p = new Uint8Array(x);
    const q = new Uint8Array(y);
    let diff = 0;
    for (let i = 0; i < p.length; i++) diff |= p[i] ^ q[i];
    return diff === 0;
}

function decode(header) {
    const [scheme, value] = (header || "").split(" ");
    if (!value || scheme.toLowerCase() !== "basic") return "";
    try {
        const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch {
        return "";
    }
}

export default async (request, context) => {
    const user = Netlify.env.get("INTERNAL_USER");
    const password = Netlify.env.get("INTERNAL_PASSWORD");
    if (!user || !password) {
        return new Response("Internal pages are not configured.", { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    if (!(await same(decode(request.headers.get("authorization")), user + ":" + password))) {
        return new Response("Login required.", {
            status: 401,
            headers: { "WWW-Authenticate": REALM, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
        });
    }

    const response = await context.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
};

export const config = { path: ["/internal", "/internal/*"] };
