async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function fetchAll() {
    return fetchJson("/api/images");
}
