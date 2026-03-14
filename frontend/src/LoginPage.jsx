import React from "react";
import { Link, useNavigate } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import "./LoginPage.css";

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

export function LoginPage({ isRegistering = false, onAuthToken }) {
    const emailInputId = React.useId();
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();

    const [result, formAction, isPending] = React.useActionState(
        async (_previousState, formData) => {
            const username = String(formData.get("username") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const password = String(formData.get("password") || "");

            const endpoint = isRegistering ? "/api/users" : "/api/auth/tokens";
            const payload = isRegistering
                ? { username, email, password }
                : { username, password };

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (isRegistering && response.status === 409) {
                        return { error: "That username is already taken." };
                    }
                    if (!isRegistering && response.status === 401) {
                        return { error: "Incorrect username or password." };
                    }
                    return { error: await readErrorMessage(response) };
                }

                const responseBody = await response.json();
                const token = typeof responseBody.token === "string" ? responseBody.token : "";
                if (token === "") {
                    return { error: "Server did not return an auth token." };
                }

                if (typeof onAuthToken === "function") {
                    onAuthToken(token);
                }

                if (isRegistering) {
                    console.log("Successfully created account");
                } else {
                    console.log(token);
                }

                navigate(VALID_ROUTES.HOME);
                return { error: "" };
            } catch (err) {
                return {
                    error: err instanceof Error ? err.message : String(err)
                };
            }
        },
        { error: "" }
    );

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={formAction}>
                <fieldset disabled={isPending}>
                    {isRegistering && (
                        <>
                            <label htmlFor={emailInputId}>Email</label>
                            <input id={emailInputId} name="email" type="email" required />
                        </>
                    )}

                    <label htmlFor={usernameInputId}>Username</label>
                    <input id={usernameInputId} name="username" required />

                    <label htmlFor={passwordInputId}>Password</label>
                    <input id={passwordInputId} name="password" type="password" required />

                    <input type="submit" value="Submit" disabled={isPending} />
                </fieldset>
            </form>
            <div aria-live="polite">
                {result.error !== "" && <p className="ErrorMessage">{result.error}</p>}
            </div>
            {isRegistering ? (
                <p>
                    Already have an account? <Link to={VALID_ROUTES.LOGIN}>Login here</Link>
                </p>
            ) : (
                <p>
                    Don't have an account? <Link to={VALID_ROUTES.REGISTER}>Register here</Link>
                </p>
            )}
        </>
    );
}
