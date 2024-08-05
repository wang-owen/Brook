import { useEffect, useState } from "react";
import { TokenHandler, convertSubmit } from "./ConvertTools";
import ConvertForm from "./ConvertForm";

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
        const payload = {
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
        };

        const body = await fetch(tokenEndpoint, payload);
        const response = await body.json();

        return response;
    };

    const getRefreshToken = async () => {
        // refresh token that has been previously stored
        const refreshToken = currentToken.refresh_token;

        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            // @ts-ignore
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
        };

        const body = await fetch(tokenEndpoint, payload);
        const response = await body.json();

        currentToken.save(response.accessToken);
    };

    useEffect(() => {
        const args = new URLSearchParams(window.location.search);
        const code = args.get("code");

        if (code) {
            getToken(code).then((token) => currentToken.save(token));

            // Remove code from URL so we can refresh correctly.
            const url = new URL(window.location.href);
            url.searchParams.delete("code");
            url.searchParams.delete("state");
            url.searchParams.delete("scope");

            const updatedUrl = url.search
                ? url.href
                : url.href.replace("#", "");
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
                `${window.location.origin}/convert/youtube`
            );
            window.localStorage.setItem("convertPlatform", "YouTube");
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
                        convertSubmit={convertSubmit}
                        platform="YouTube"
                        body={{
                            access_token: currentToken.access_token,
                        }}
                        platformColor={color}
                    />
                    <button
                        className={`btn btn-sm text-white hover:opacity-80 absolute bottom-24`}
                        style={{ backgroundColor: color }}
                        onClick={() => currentToken.clear()}
                    >
                        Disconnect from YouTube
                    </button>
                </div>
            ) : (
                <div className="flex justify-center w-full">
                    <button
                        className={`btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white hover:opacity-80`}
                        style={{ backgroundColor: color }}
                        onClick={() => redirectToYouTubeAuthorize()}
                    >
                        Connect with YouTube
                    </button>
                </div>
            )}
        </>
    );
};

export default ConvertYouTube;
