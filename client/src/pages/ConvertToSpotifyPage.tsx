import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../layouts/MainLayout";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const ConvertToSpotifyPage = () => {
    const { theme } = useContext(ThemeContext);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [link, setLink] = useState("");

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = "http://127.0.0.1:3000/convert/spotify";

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

    async function getUserID() {
        let accessToken = localStorage.getItem("access_token");

        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        const data = await response.json();

        return data.id;
    }

    const convert = async (link: string) => {
        const toastID = toast.loading(
            `${String.fromCodePoint(0x1f3bb)} Brewing music...`
        );

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/convert/spotify/`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: currentToken.access_token,
                    user_id: await getUserID(),
                    link: link,
                }),
            }
        );

        if (response.ok) {
            toast.update(toastID, {
                render: "Successfully converted playlist",
                type: "success",
                isLoading: false,
                autoClose: 5000,
            });
        } else {
            toast.update(toastID, {
                render: "Invalid link",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
        }
    };

    const convertSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Clear input field
        const inputElement = document.getElementById("convert-input");
        if (inputElement) {
            (inputElement as HTMLInputElement).value = "";
        }
        return convert(link);
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

        clear: function () {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("expires_in");
            localStorage.removeItem("expires");
            setIsAuthenticated(false);
        },
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
            // Check if token is expired
        } else if (
            currentToken.expires &&
            new Date().getTime() > new Date(currentToken.expires).getTime()
        ) {
            getRefreshToken();
        }

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

    const [inputHover, setInputHover] = useState(false);
    const formClass = `bg-zinc-900 rounded-lg p-3 py-2 duration-1000 border ${
        theme === "light" ? "border-black" : "border-white"
    } ${
        inputHover
            ? theme === "light"
                ? "w-1/2 shadow-2xl shadow-black border-white"
                : "w-1/2 shadow-2xl shadow-white border-black"
            : "w-1/4 2xl:w-1/5"
    }`;
    const inputBar = `absolute h-0 mt-9 border-white border-b-2 hover:w-full duration-1000 ease-in-out ${
        inputHover ? "w-full" : "w-0"
    }`;

    return (
        <section className="min-h-screen">
            {isAuthenticated ? (
                <div className="flex flex-col h-screen justify-center items-center">
                    <form
                        onSubmit={convertSubmit}
                        className="w-full flex flex-col justify-center items-center gap-16"
                    >
                        <div className={formClass}>
                            <div className="relative flex justify-between items-center mx-5 my-2">
                                <input
                                    id="convert-input"
                                    className="bg-transparent text-white w-full border-none focus:outline-none"
                                    type="url"
                                    name="link"
                                    placeholder="YouTube Playlist URL"
                                    onChange={(event) =>
                                        setLink(event.target.value)
                                    }
                                    onFocus={() => setInputHover(true)}
                                    onBlur={() => setInputHover(false)}
                                    onMouseOver={() => setInputHover(true)}
                                    onMouseOut={() => setInputHover(false)}
                                />
                                <div className={inputBar} />
                            </div>
                        </div>
                        <motion.button
                            type="submit"
                            initial={{
                                backgroundImage:
                                    "linear-gradient(to right, black, black), linear-gradient(0deg, blue, black)",
                            }}
                            animate={{
                                backgroundImage: `linear-gradient(to right, ${
                                    theme === "light"
                                        ? "white, white"
                                        : "black, black"
                                }), linear-gradient(360deg, blue, ${
                                    theme === "light" ? "white" : "black"
                                })`,
                            }}
                            transition={{
                                type: "tween",
                                ease: "linear",
                                duration: 3,
                                repeat: Infinity,
                            }}
                            className="hover:scale-110 duration-300"
                            style={{
                                border: "4px solid transparent",
                                borderRadius: "20px",
                                backgroundClip: "padding-box, border-box",
                                backgroundOrigin: "padding-box, border-box",
                                color: `${
                                    theme === "light" ? "black" : "white"
                                }`,
                                padding: 25,
                                fontWeight: "bold",
                                width: 200,
                                height: 40,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            Convert to Spotify
                        </motion.button>
                    </form>
                    <button
                        className="border bg-green-400 p-2 text-black font-semibold border-black hover:opacity-50 duration-300 rounded-xl"
                        onClick={() => currentToken.clear()}
                    >
                        Disconnect from Spotify
                    </button>
                </div>
            ) : (
                <div className="flex h-screen justify-center items-center">
                    <button
                        className="border bg-green-400 p-2 text-black font-semibold border-black hover:opacity-50 duration-300 rounded-xl"
                        onClick={() => redirectToSpotifyAuthorize()}
                    >
                        Connect with Spotify
                    </button>
                </div>
            )}
        </section>
    );
};

export default ConvertToSpotifyPage;
