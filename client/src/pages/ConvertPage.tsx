const ConvertPage = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = "https://open.spotify.com/";

    const authorizationEndpoint = "https://accounts.spotify.com/authorize";
    // const tokenEndpoint = "https://accounts.spotify.com/api/token";
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

    return (
        <section className="min-h-screen flex">
            ConvertPage
            <button
                className="self-center border bg-red-500 p-2 text-black border-black hover:opacity-50 duration-300"
                onClick={() => redirectToSpotifyAuthorize()}
            >
                Authorize
            </button>
        </section>
    );
};

export default ConvertPage;
