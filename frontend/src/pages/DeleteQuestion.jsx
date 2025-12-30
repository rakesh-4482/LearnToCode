import React, { useState } from "react";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { BACKEND_URL } from "../../config";

const DeleteQuestion = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const handleDeleteQuestion = () => {
        setLoading(true);
        axios
            .delete(`${BACKEND_URL}/questions/${id}`, {
                withCredentials: true,
            })
            .then(() => {
                setLoading(false);
                enqueueSnackbar("Question Deleted successfully", {
                    variant: "success",
                });
                navigate("/");
            })
            .catch((error) => {
                setLoading(false);
                // alert('An error happened. Please Chack console');
                enqueueSnackbar("Error", { variant: "error" });
                console.log(error);
            });
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl my-4">Delete Question</h1>
            {loading ? <Spinner /> : ""}
            <div className="flex flex-col items-center border-2 border-sky-400 rounded-xl w-[600px] p-8 mx-auto">
                <h3 className="text-2xl">
                    Are You Sure You want to delete this question?
                </h3>

                <button
                    className="p-4 bg-red-600 text-white m-8 w-full"
                    onClick={handleDeleteQuestion}
                >
                    Yes, Delete it
                </button>
            </div>
        </div>
    );
};

export default DeleteQuestion;
