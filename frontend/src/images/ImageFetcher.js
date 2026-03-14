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

function buildAuthHeaders(authToken, extraHeaders = {}) {
    return {
        ...extraHeaders,
        Authorization: `Bearer ${authToken}`
    };
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json();
}

export function fetchAll(authToken) {
    return fetchJson("/api/images", {
        headers: buildAuthHeaders(authToken)
    });
}

export async function fetchOne(imageId, authToken) {
    const response = await fetch(`/api/images/${encodeURIComponent(imageId)}`, {
        headers: buildAuthHeaders(authToken)
    });
    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json();
}

export async function renameImage(imageId, newName, authToken) {
    const response = await fetch(`/api/images/${encodeURIComponent(imageId)}`, {
        method: "PATCH",
        headers: buildAuthHeaders(authToken, {
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({ name: newName })
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }
}
