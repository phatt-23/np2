// 2026-04-10

export const errLabelMessage = `Use only letters, digits, and the symbols _,\\(){}. Every \\ must be followed by letters (e.g. \\alpha).`;

export function isValidLabel(value: string): boolean {
    // only allowed characters overall
    if (!/^[a-zA-Z0-9_\\,(){}]+$/.test(value)) {
        return false;
    }

    // every '\' must be followed by at least one letter
    for (let i = 0; i < value.length; i++) {
        if (value[i] === '\\') {
            const next = value[i + 1];
            if (!next || !/[a-zA-Z]/.test(next)) {
                return false;
            }
        }
    }

    return true;
}

