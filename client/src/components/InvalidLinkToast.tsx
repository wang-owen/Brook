import { useState } from "react";
import { Id, toast } from "react-toastify";
import { FaCircleInfo } from "react-icons/fa6";

const InvalidLinkToast = (toastID: Id | null = null) => {
    const Render = () => {
        const [text, setText] = useState("Invalid link");

        return (
            <div className="flex items-center">
                <div className={`${text !== "Invalid link" && "text-red-500"}`}>
                    {text}
                </div>
                <span
                    className="ml-1 hover:opacity-50 duration-100"
                    onClick={() =>
                        setText(
                            text === "Invalid link"
                                ? "If link is correct, make sure the track/playlist is unlisted or public"
                                : "Invalid link"
                        )
                    }
                >
                    <FaCircleInfo />
                </span>
            </div>
        );
    };

    if (toastID) {
        return toast.update(toastID, {
            render: <Render />,
            type: "error",
            isLoading: false,
            autoClose: 5000,
        });
    } else {
        return toast.error(<Render />);
    }
};

export default InvalidLinkToast;
