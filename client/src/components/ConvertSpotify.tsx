import { useEffect, useState } from "react";
import { TokenHandler, convertSubmit } from "./ConvertTools";
import ConvertForm from "./ConvertForm";

const ConvertSpotify = ({ color }: { color: string }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const currentToken = TokenHandler("Spotify", setIsAuthenticated);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/convert/spotify`;

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
        const response = await body.json();

        return response;
    };

    const getRefreshToken = async () => {
        // refresh token that has been previously stored
        const refreshToken = localStorage.getItem("refresh_token");

        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // @ts-ignore
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: clientId,
            }),
        };

        const body = await fetch(tokenEndpoint, payload);
        const response = await body.json();

        localStorage.setItem("access_token", response.accessToken);
        localStorage.setItem("refresh_token", response.refreshToken);
    };

    const getBody = async () => {
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: "Bearer " + currentToken.access_token,
            },
        });
        const data = await response.json();

        return { access_token: currentToken.access_token, user_id: data.id };
    };

    useEffect(() => {
        // On page load, try to fetch auth code from current browser search URL
        const args = new URLSearchParams(window.location.search);
        const code = args.get("code");

        // If we find a code, we're in a callback, do a token exchange
        if (code) {
            getToken(code).then((token) => currentToken.save(token));

            // Remove code from URL so we can refresh correctly.
            const url = new URL(window.location.href);
            url.searchParams.delete("code");

            const updatedUrl = url.search
                ? url.href
                : url.href.replace("?", "");
            window.history.replaceState({}, document.title, updatedUrl);

            setIsAuthenticated(true);
        } else if (
            // Check if token is expired
            currentToken.expires &&
            new Date().getTime() > new Date(currentToken.expires).getTime()
        ) {
            getRefreshToken();
        } else {
            history.replaceState(
                null,
                "",
                `${window.location.origin}/convert/spotify`
            );
            window.localStorage.setItem("convertPlatform", "Spotify");
        }

        // Check if token is expired
        if (
            currentToken.access_token &&
            currentToken.expires &&
            new Date().getTime() < new Date(currentToken.expires).getTime()
        ) {
            isAuthenticated === false ? setIsAuthenticated(true) : null;
        } else {
            isAuthenticated === true ? setIsAuthenticated(false) : null;
        }
    }, []);

    return (
        <>
            {isAuthenticated ? (
                <div className="flex w-full justify-center">
                    <ConvertForm
                        platform="Spotify"
                        platformColor={color}
                        convertSubmit={convertSubmit}
                        getBody={getBody}
                    />
                    <button
                        className={`btn btn-sm text-white hover:opacity-80 absolute bottom-24`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                            currentToken.clear();
                            setIsAuthenticated(false);
                        }}
                    >
                        Disconnect from Spotify
                    </button>
                </div>
            ) : (
                <div className="flex justify-center w-full">
                    <button
                        className={`btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white hover:opacity-80`}
                        style={{ backgroundColor: color }}
                        onClick={() => redirectToSpotifyAuthorize()}
                    >
                        Connect with Spotify
                    </button>
                </div>
            )}
        </>
    );
};

export default ConvertSpotify;
