import { useEffect, useState } from "react";
import { TokenHandler, convertSubmit, onPageLoad } from "./ConvertTools";
import ConvertSection from "./ConvertSection";

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

        const response = await fetch(tokenEndpoint, {
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
        });

        return await response.json();
    };

    const refreshToken = async () => {
        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // @ts-ignore
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: currentToken.refresh_token,
                client_id: clientId,
            }),
        });

        if (response.ok) {
            currentToken.save(await response.json());
            isAuthenticated === false ? setIsAuthenticated(true) : null;
        } else {
            isAuthenticated === true ? setIsAuthenticated(false) : null;
        }
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
        onPageLoad(
            "Spotify",
            getToken,
            currentToken,
            setIsAuthenticated,
            refreshToken
        );
    }, []);

    return (
        <ConvertSection
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            platform="YouTube"
            color={color}
            convertSubmit={convertSubmit}
            getBody={getBody}
            currentToken={currentToken}
            redirect={redirectToSpotifyAuthorize}
        />
    );
};

export default ConvertSpotify;
