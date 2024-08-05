import { SetStateAction } from "react";
import { toast } from "react-toastify";

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
            localStorage.setItem(`${_platform}_access_token`, access_token);
            localStorage.setItem(`${_platform}_refresh_token`, refresh_token);
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

const convert = async (platform: string, body: any) => {
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
        toast.update(toastID, {
            render: "Invalid link",
            type: "error",
            isLoading: false,
            autoClose: 5000,
        });
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
