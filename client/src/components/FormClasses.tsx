export const formInputClass = (inputHover: boolean, theme: string) =>
    `bg-zinc-900 rounded-lg p-3 py-2 duration-1000 border ${
        inputHover ? "w-2/3 lg:w-2/5 shadow-2xl" : "w-1/3 lg:w-1/4 shadow-none"
    } ${theme === "light" ? "shadow-black" : "shadow-white"}`;

export const inputBarClass = (inputHover: boolean) =>
    `absolute h-0 mt-9 border-white border-b-2 hover:w-full duration-1000 ease-in-out ${
        inputHover ? "w-full" : "w-0"
    }`;
