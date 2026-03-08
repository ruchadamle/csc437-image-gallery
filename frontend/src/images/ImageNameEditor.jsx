import { useState } from "react";
import { renameImage } from "./ImageFetcher.js";

export function ImageNameEditor({ imageId, initialValue, onRenameSuccess }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(initialValue || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleEditPressed() {
        setIsEditingName(true);
        setNameInput(initialValue || "");
        setError("");
    }

    async function handleSubmitPressed() {
        setIsSubmitting(true);
        setError("");

        try {
            await renameImage(imageId, nameInput);
            if (typeof onRenameSuccess === "function") {
                onRenameSuccess(nameInput);
            }
            setIsEditingName(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name
                    <input
                        required
                        disabled={isSubmitting}
                        style={{ marginLeft: "0.5em" }}
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                    />
                </label>
                <button
                    disabled={nameInput.length === 0 || isSubmitting}
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button disabled={isSubmitting} onClick={() => setIsEditingName(false)}>
                    Cancel
                </button>
                <div aria-live="polite">
                    {isSubmitting && <p>Renaming image...</p>}
                    {error !== "" && <p>{error}</p>}
                </div>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={handleEditPressed}>Edit name</button>
                <div aria-live="polite">{error !== "" && <p>{error}</p>}</div>
            </div>
        );
    }
}
