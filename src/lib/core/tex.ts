// Created by phatt-23 on 25/12/2025 

import * as kx from "katex";

type Token =
    | { type: "text"; value: string }
    | { type: "math-inline"; value: string }
    | { type: "math-display"; value: string };

const MATH_REGEX =
    /(?<!\\)(\$\$(.+?)(?<!\\)\$\$|\$(.+?)(?<!\\)\$)/gs;
    
function tokenizeMath(input: string): Token[] {
    const tokens: Token[] = [];
    let lastIndex = 0;

    for (const match of input.matchAll(MATH_REGEX)) {
        const start = match.index!;
        const end = start + match[0].length;

        // text before math
        tokens.push({
            type: "text",
            value: input.slice(lastIndex, start),
        });

        if (match[2]) {
            tokens.push({
                type: "math-display",
                value: match[2],
            });
        } else {
            tokens.push({
                type: "math-inline",
                value: match[3],
            });
        }

        lastIndex = end;
    }

    tokens.push({
        type: "text",
        value: input.slice(lastIndex),
    });

    return tokens;
}


function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

type KatexOptions = {
    displayMode?: boolean; 
    inline?: boolean;
    html?: boolean;
};

const defaultKatexOptions: KatexOptions = {
    displayMode: false,
    inline: false,
    html: false,
}

export function tex(
    input: string,
    opts: KatexOptions = defaultKatexOptions
): string {
    if (opts.inline) {
        return tokenizeMath(input)
            .map(token => {
                switch (token.type) {
                    case "text":
                        return opts.html
                            ? token.value
                            : escapeHtml(token.value);

                    case "math-inline":
                        return kx.renderToString(token.value, {
                            throwOnError: false,
                            displayMode: false,
                        });

                    case "math-display":
                        return kx.renderToString(token.value, {
                            throwOnError: false,
                            displayMode: true,
                        });
                }
            })
            .join("");
    }
    else {
        return kx.renderToString(input, {
            throwOnError: false,
            displayMode: opts.displayMode,
        });
    }
}

