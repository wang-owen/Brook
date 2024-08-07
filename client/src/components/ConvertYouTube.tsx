import { useEffect, useState } from "react";
import { TokenHandler, convertSubmit, onPageLoad } from "./ConvertTools";
import ConvertSection from "./ConvertSection";

const ConvertYouTube = ({ color }: { color: string }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const currentToken = TokenHandler("YouTube", setIsAuthenticated);

    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
    const redirectUri = `${window.location.origin}/convert/youtube`;

    const authorizationEndpoint =
        "https://accounts.google.com/o/oauth2/v2/auth";
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const scope = "https://www.googleapis.com/auth/youtubepartner";

    const redirectToYouTubeAuthorize = async () => {
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

        const authUrl = new URL(authorizationEndpoint);
        const params = {
            scope: scope,
            access_type: "offline",
            prompt: "select_account",
            response_type: "code",
            state: code_challenge_base64,
            redirect_uri: redirectUri,
            client_id: clientId,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    };

    const getToken = async (code: string) => {
        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // @ts-ignore
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
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
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: currentToken.refresh_token,
                grant_type: "refresh_token",
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
        return { access_token: currentToken.access_token };
    };

    useEffect(() => {
        onPageLoad(
            "YouTube",
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
            redirect={redirectToYouTubeAuthorize}
        />
    );
};

export default ConvertYouTube;
