import { SetStateAction } from "react";
import { toast } from "react-toastify";
import InvalidLinkToast from "./InvalidLinkToast";

export const TokenHandler = (
    platform: string,
    setIsAuthenticated: React.Dispatch<SetStateAction<boolean>>
) => {
    const _platform = platform.toLowerCase();
    return {
        get access_token() {
            return localStorage.getItem(`${_platform}_access_token`) || null;
        },
        get refresh_token() {
            return localStorage.getItem(`${_platform}_refresh_token`) || null;
        },
        get expires_in() {
            return localStorage.getItem(`${_platform}_expires_in`) || null;
        },
        get expires() {
            return localStorage.getItem(`${_platform}_expires`) || null;
        },

        save: function (response: any) {
            const { access_token, refresh_token, expires_in } = response;
            if (access_token)
                localStorage.setItem(`${_platform}_access_token`, access_token);
            if (refresh_token)
                localStorage.setItem(
                    `${_platform}_refresh_token`,
                    refresh_token
                );
            if (expires_in)
                localStorage.setItem(`${_platform}_expires_in`, expires_in);

            const now = new Date();
            const expiry = new Date(now.getTime() + expires_in * 1000);
            localStorage.setItem(`${_platform}_expires`, expiry.toString());
        },

        clear: function () {
            localStorage.removeItem(`${_platform}_access_token`);
            localStorage.removeItem(`${_platform}_refresh_token`);
            localStorage.removeItem(`${_platform}_expires_in`);
            localStorage.removeItem(`${_platform}_expires`);

            setIsAuthenticated(false);
        },
    };
};

const convert = async (platform: string, body: Object) => {
    const toastID = toast.loading("Converting playlist...");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/convert/${platform.toLowerCase()}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    );

    if (response.ok) {
        const data = await response.json();
        toast.update(toastID, {
            render() {
                return (
                    <div>
                        Successfully converted{" "}
                        <a
                            className="underline"
                            href={data.url}
                            target="_blank"
                        >
                            playlist
                        </a>
                    </div>
                );
            },
            type: "success",
            isLoading: false,
            autoClose: 5000,
        });
    } else {
        InvalidLinkToast(toastID);
    }
};

export const convertSubmit = async (
    event: React.FormEvent,
    platform: string,
    getBody: () => Promise<any>,
    link: string
) => {
    event.preventDefault();
    // Clear input field
    const inputElement = document.getElementById("convert-input");
    if (inputElement) {
        (inputElement as HTMLInputElement).value = "";
    }
    return convert(platform, { ...(await getBody()), link: link });
};

export const onPageLoad = (
    platform: string,
    setIsAuthenticated: React.Dispatch<SetStateAction<boolean>>,
    currentToken: any,
    getToken: (code: string) => Promise<void>,
    refreshToken: () => Promise<void>
) => {
    const args = new URLSearchParams(window.location.search);
    const code = args.get("code");

    if (code) {
        getToken(code).then((token: any) => currentToken.save(token));

        // Remove code from URL so we can refresh correctly.
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        url.searchParams.delete("scope");

        const updatedUrl = url.search
            ? url.href
            : url.href.replace("#", "").replace("?", "");
        window.history.replaceState({}, document.title, updatedUrl);

        setIsAuthenticated(true);
    } else if (currentToken.access_token) {
        if (
            // Check if token is expired
            currentToken.expires &&
            new Date().getTime() > new Date(currentToken.expires).getTime()
        ) {
            refreshToken();
        } else {
            setIsAuthenticated(true);
        }
    }

    history.replaceState(
        null,
        "",
        `${window.location.origin}/convert/${platform.toLowerCase()}`
    );
    localStorage.setItem("convertPlatform", platform);
};
