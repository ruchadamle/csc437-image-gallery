import React from "react";

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
    });
}

async function readErrorMessage(response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        try {
            const payload = await response.json();
            if (typeof payload.message === "string" && payload.message !== "") {
                return payload.message;
            }
        } catch {
            // ignore
        }
    }
    return `Request failed with HTTP ${response.status}`;
}

export function UploadPage({ authToken }) {
    const fileInputId = React.useId();
    const [previewDataUrl, setPreviewDataUrl] = React.useState("");

    const [result, formAction, isPending] = React.useActionState(
        async (_prevState, formData) => {
            try {
                const response = await fetch("/api/images", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    setPreviewDataUrl("");
                    return { error: await readErrorMessage(response) };
                }

                return { error: "" };
            } catch (err) {
                setPreviewDataUrl("");
                return { error: err instanceof Error ? err.message : String(err) };
            }
        },
        { error: "" }
    );

    async function handleFileInputChanged(event) {
        const file = event.target.files?.[0];
        if (!file) {
            setPreviewDataUrl("");
            return;
        }

        try {
            const dataUrl = await readAsDataURL(file);
            setPreviewDataUrl(String(dataUrl || ""));
        } catch {
            setPreviewDataUrl("");
        }
    }

    return (
        <>
            <h2>Upload</h2>
            <form action={formAction}>
                <fieldset disabled={isPending}>
                    <div>
                        <label htmlFor={fileInputId}>Choose image to upload: </label>
                        <input
                            id={fileInputId}
                            name="image"
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            required
                            onChange={handleFileInputChanged}
                        />
                    </div>
                    <div>
                        <label>
                            <span>Image title: </span>
                            <input name="name" required />
                        </label>
                    </div>
                    <div>
                        {previewDataUrl !== "" && (
                            <img
                                style={{ width: "20em", maxWidth: "100%" }}
                                src={previewDataUrl}
                                alt=""
                            />
                        )}
                    </div>
                    <input type="submit" value="Confirm upload" disabled={isPending} />
                </fieldset>
            </form>
            <div aria-live="polite">{result.error !== "" && <p className="ErrorMessage">{result.error}</p>}</div>
        </>
    );
}
