import { useEffect, useState } from "react";
import ConvertForm from "./ConvertForm";

const ConvertYouTube = ({ color }: { color: string }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
    const redirectUri = "http://127.0.0.1:3000/convert";

    const authorizationEndpoint =
        "https://accounts.google.com/o/oauth2/v2/auth";
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const scope =
        "https://www.googleapis.com/auth/youtubeparhttps://oauth2.googleapis.com/tokentner";

    const currentToken = {
        clear: function () {
            setIsAuthenticated(false);
        },
    };

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
            access_type: "online",
            response_type: "code",
            state: code_challenge_base64,
            redirect_uri: redirectUri,
            client_id: clientId,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    };

    const convertSubmit = () => {
        return;
    };

    const getToken = async (code: string) => {
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
            }),
        };

        const body = await fetch(tokenEndpoint, payload);
        const response = await body.json();

        return response;
    };

    useEffect(() => {
        history.replaceState(
            null,
            "",
            `${import.meta.env.VITE_CLIENT_URL}/convert/youtube`
        );
        window.localStorage.setItem("convertPlatform", "YouTube");
    }, []);

    return (
        <>
            {isAuthenticated ? (
                <div className="flex w-full justify-center">
                    <ConvertForm
                        convertSubmit={convertSubmit}
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
