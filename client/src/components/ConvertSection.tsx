import React, { SetStateAction } from "react";
import ConvertForm from "./ConvertForm";

const ConvertSection = ({
    isAuthenticated,
    setIsAuthenticated,
    platform,
    color,
    convertSubmit,
    getBody,
    currentToken,
    redirect,
}: {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<SetStateAction<boolean>>;
    platform: string;
    color: string;
    convertSubmit: (
        event: React.FormEvent,
        platform: string,
        getBody: () => Promise<any>,
        link: string
    ) => Promise<void>;
    getBody: () => Promise<any>;
    currentToken: any;
    redirect: () => Promise<void>;
}) => {
    return isAuthenticated ? (
        <div className="flex w-full justify-center">
            <ConvertForm
                platform={platform}
                platformColor={color}
                convertSubmit={convertSubmit}
                getBody={getBody}
            />
            <button
                className={`btn btn-sm text-white hover:opacity-80 absolute bottom-24`}
                style={{ backgroundColor: color }}
                onClick={() => {
                    currentToken.clear();
                    setIsAuthenticated(false);
                }}
            >
                Disconnect from {platform}
            </button>
        </div>
    ) : (
        <div className="flex justify-center w-full">
            <button
                className={`btn btn-xs sm:btn-sm md:btn-md lg:btn-lg text-white hover:opacity-80`}
                style={{ backgroundColor: color }}
                onClick={() => redirect()}
            >
                Connect with {platform}
            </button>
        </div>
    );
};

export default ConvertSection;
