import { useState } from "react";

const ConvertPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = "http://127.0.0.1:3000/convert";

    const authorizationEndpoint = "https://accounts.spotify.com/authorize";
    const tokenEndpoint = "https://accounts.spotify.com/api/token";
    const scope =
        "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public";

    const redirectToSpotifyAuthorize = async () => {
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const randomValues = crypto.getRandomValues(new Uint8Array(64));
        const randomString = randomValues.reduce(
            (acc, x) => acc + possible[x % possible.length],
            ""
        );

        const code_verifier = randomString;
        const data = new TextEncoder().encode(code_verifier);
        const hashed = await crypto.subtle.digest("SHA-256", data);

        const code_challenge_base64 = btoa(
            String.fromCharCode(...new Uint8Array(hashed))
        )
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        window.localStorage.setItem("code_verifier", code_verifier);

        const authUrl = new URL(authorizationEndpoint);
        const params = {
            response_type: "code",
            client_id: clientId,
            scope: scope,
            code_challenge_method: "S256",
            code_challenge: code_challenge_base64,
            redirect_uri: redirectUri,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
    };

    const getToken = async (code: string) => {
        // stored in the previous step
        let codeVerifier = localStorage.getItem("code_verifier");

        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // @ts-ignore
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            }),
        };

        const body = await fetch(tokenEndpoint, payload);
        const response = body.json();

        return response;
    };

    // Data structure that manages the current active token, caching it in localStorage
    const currentToken = {
        get access_token() {
            return localStorage.getItem("access_token") || null;
        },
        get refresh_token() {
            return localStorage.getItem("refresh_token") || null;
        },
        get expires_in() {
            return localStorage.getItem("refresh_in") || null;
        },
        get expires() {
            return localStorage.getItem("expires") || null;
        },

        save: function (response: any) {
            const { access_token, refresh_token, expires_in } = response;
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("expires_in", expires_in);

            const now = new Date();
            const expiry = new Date(now.getTime() + expires_in * 1000);
            localStorage.setItem("expires", expiry.toString());
        },
    };

    // On page load, try to fetch auth code from current browser search URL
    const args = new URLSearchParams(window.location.search);
    const code = args.get("code");

    // If we find a code, we're in a callback, do a token exchange
    if (code) {
        getToken(code).then((token) => currentToken.save(token));

        // Remove code from URL so we can refresh correctly.
        const url = new URL(window.location.href);
        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace("?", "");
        window.history.replaceState({}, document.title, updatedUrl);
    }

    if (currentToken.access_token) {
        isAuthenticated === false ? setIsAuthenticated(true) : null;
    } else {
        isAuthenticated === true ? setIsAuthenticated(false) : null;
    }

    return (
        <section className="min-h-screen">
            ConvertPage
            {isAuthenticated ? null : (
                <div className="flex h-screen justify-center items-center">
                    <button
                        className="border bg-red-400 p-2 text-black border-black hover:opacity-50 duration-300 rounded-xl"
                        onClick={() => redirectToSpotifyAuthorize()}
                    >
                        Authorize
                    </button>
                </div>
            )}
        </section>
    );
};

export default ConvertPage;
