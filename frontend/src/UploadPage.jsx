import React from "react";
import { useNavigate } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

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
    const nameInputId = React.useId();
    const [previewDataUrl, setPreviewDataUrl] = React.useState("");
    const navigate = useNavigate();

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

                const responseBody = await response.json();
                const imageId = String(responseBody?.imageId || "");
                if (imageId === "") {
                    return { error: "Server did not return image id." };
                }

                navigate(VALID_ROUTES.IMAGE_DETAILS.replace(":imageId", encodeURIComponent(imageId)));
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
                <fieldset disabled={isPending} style={{ border: 0, margin: 0, padding: 0 }}>
                    <div>
                        <label htmlFor={fileInputId}>Choose image to upload:</label>
                        <input
                            id={fileInputId}
                            name="image"
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            required
                            onChange={handleFileInputChanged}
                            style={{ display: "block", marginTop: "0.35em" }}
                        />
                    </div>
                    <div style={{ marginTop: "1em" }}>
                        <label htmlFor={nameInputId}>Image title:</label>
                        <input
                            id={nameInputId}
                            name="name"
                            required
                            style={{ display: "block", marginTop: "0.35em" }}
                        />
                    </div>
                    <div style={{ marginTop: "1em" }}>
                        {previewDataUrl !== "" && (
                            <img
                                style={{ width: "20em", maxWidth: "100%" }}
                                src={previewDataUrl}
                                alt=""
                            />
                        )}
                    </div>
                    <input
                        type="submit"
                        value="Confirm upload"
                        disabled={isPending}
                        style={{ marginTop: "1em" }}
                    />
                </fieldset>
            </form>
            <div aria-live="polite">{result.error !== "" && <p className="ErrorMessage">{result.error}</p>}</div>
        </>
    );
}
