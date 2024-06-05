/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeInFromLeft: {
                    "0%": { opacity: "0", transform: "translateX(-25px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                fadeInFromTop: {
                    "0%": { opacity: "0", transform: "translateY(-25px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeInFromBottom: {
                    "0%": { opacity: "0", transform: "translateY(25px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 1s ease-in-out",
                fadeInFromLeft: "fadeInFromLeft 1s ease-in-out",
                fadeInFromTop: "fadeInFromTop 1s ease-in-out",
                fadeInFromBottom: "fadeInFromBottom 1s ease-in-out",
            },
        },
    },
    plugins: [require("daisyui")],
};
