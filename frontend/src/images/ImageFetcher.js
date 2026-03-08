async function readErrorMessage(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            const payload = await response.json();
            if (typeof payload.message === "string" && payload.message !== "") {
                return payload.message;
            }
        } catch {
            // Ignore JSON parse failures and use fallback below.
        }
    }

    return `Error: HTTP ${response.status} ${response.statusText}`;
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json();
}

export function fetchAll() {
    return fetchJson("/api/images");
}

export async function fetchOne(imageId) {
    const response = await fetch(`/api/images/${encodeURIComponent(imageId)}`);
    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json();
}

export async function renameImage(imageId, newName) {
    const response = await fetch(`/api/images/${encodeURIComponent(imageId)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newName })
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }
}
