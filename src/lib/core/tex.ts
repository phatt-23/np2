// Created by phatt-23 on 25/12/2025 

import * as kx from "katex";

type Token = { type: "text"; value: string } 
            | { type: "math"; value: string };

const INLINE_MATH_REGEX = /(?<!\\)\$(.+?)(?<!\\)\$/gs;

function tokenizeMath(input: string): Token[] {
    const tokens: Token[] = [];
    let lastIndex = 0;

    for (const match of input.matchAll(INLINE_MATH_REGEX)) {
        const start = match.index!;
        const end = start + match[0].length;

        tokens.push({
            type: "text",
            value: input.slice(lastIndex, start),
        });

        tokens.push({
            type: "math",
            value: match[1],
        });

        lastIndex = end;
    }

    tokens.push({
        type: "text",
        value: input.slice(lastIndex)
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

export function tex(input: string, opts: KatexOptions = defaultKatexOptions): string {
    if (opts.inline) {
        return tokenizeMath(input)
            .map(token => {
                if (token.type === "text") {
                    if (opts.html) {
                        return token.value;
                    }
                    else {
                        return escapeHtml(token.value);
                    }
                }

                return kx.renderToString(token.value, {
                    throwOnError: false,
                    displayMode: false
                });
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


