export function parseTimeInput(raw: string): number {
    const trimmed = raw.trim().toLowerCase();

    if (trimmed.endsWith("ms")) {
        return parseFloat(trimmed.replace("ms", "")) / 1000;
    }

    if (trimmed.endsWith("us") || trimmed.endsWith("µs")) {
        return parseFloat(trimmed.replace(/(us|µs)/, "")) / 1_000_000;
    }

    if (trimmed.endsWith("s")) {
        return parseFloat(trimmed.replace("s", ""));
    }

    // fallback: assume seconds
    return parseFloat(trimmed);
}

export function formatTimeOutput(seconds: number): string {
    if (seconds >= 1) {
        return `${seconds.toFixed(2)} s`;
    } else if (seconds >= 1e-3) {
        return `${(seconds * 1e3).toFixed(1)} ms`;
    } else {
        return `${(seconds * 1e6).toFixed(0)} us`;
    }
}
