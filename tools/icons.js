// Inline icons at build time. Every <iconify-icon icon="set:name"> in the
// built HTML and JS gets its SVG inside it, from the icon sets installed in
// node_modules, so pages need no icon script and make no request for icons.
// The element stays as a plain wrapper (base.css sizes it), so CSS that
// targets iconify-icon keeps working. An unknown icon name fails the build.

const SETS = {
    fluent: require("@iconify-json/fluent/icons.json"),
    "fa6-brands": require("@iconify-json/fa6-brands/icons.json"),
};

function iconSvg(name) {
    const [prefix, id] = name.split(":");
    const set = SETS[prefix];
    if (!set) throw new Error(`icons: no icon set "${prefix}" installed (icon "${name}")`);
    let icon = set.icons[id];
    let key = id;
    // Aliases point at another icon (no flips or rotations are used here).
    for (let i = 0; !icon && set.aliases && set.aliases[key] && i < 5; i++) {
        const alias = set.aliases[key];
        if (alias.hFlip || alias.vFlip || alias.rotate) throw new Error(`icons: "${name}" is a transformed alias, not supported`);
        key = alias.parent;
        icon = set.icons[key];
    }
    if (!icon) throw new Error(`icons: unknown icon "${name}"`);
    const w = icon.width || set.width || 16;
    const h = icon.height || set.height || 16;
    const left = icon.left || 0;
    const top = icon.top || 0;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${w} ${h}" width="1em" height="1em" aria-hidden="true" focusable="false">${icon.body}</svg>`;
}

// Fill every empty <iconify-icon icon="…"></iconify-icon> in a text.
function fillIcons(text) {
    return text.replace(/<iconify-icon\b([^>]*?)\sicon=(["'])([\w-]+:[\w-]+)\2([^>]*)>\s*<\/iconify-icon>/g,
        (m, before, q, name, after) => `<iconify-icon${before} icon=${q}${name}${q}${after}>${iconSvg(name)}</iconify-icon>`);
}

module.exports = { fillIcons, iconSvg };
