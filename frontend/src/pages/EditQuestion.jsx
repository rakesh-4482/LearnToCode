import React, { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { QUESTION_TOPICS } from "../utils/questionTopics";
import { BACKEND_URL } from "../../config";

const EditQuestion = () => {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [problemStatement, setProblemStatement] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [topics, setTopics] = useState([]);
    const [constraints, setConstraints] = useState("");
    const [examples, setExamples] = useState([]);
    const [publicTestCases, setPublicTestCases] = useState([]);
    const [hiddenTestCases, setHiddenTestCases] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${BACKEND_URL}/questions/${id}`)
            .then((res) => {
                const data = res.data;
                setTitle(data.title);
                setAuthor(data.author || "");
                setProblemStatement(data.problemStatement || "");
                setDifficulty(data.difficulty || "easy");
                setTopics(data.topics || []);
                setConstraints(data.constraints || "");
                setExamples(data.examples || []);
                setPublicTestCases(data.publicTestCases || []);
                setHiddenTestCases(data.hiddenTestCases || []);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                enqueueSnackbar("Failed to load question.", {
                    variant: "error",
                });
                console.error(err);
            });
    }, [id]);

    const handleUpdate = async () => {
        if (topics.length > 3) {
            enqueueSnackbar("You can only select up to 3 topics", {
                variant: "error",
            });
            return;
        }

        if (!author.trim() || !problemStatement.trim()) {
            enqueueSnackbar("Author and Problem Statement are required.", {
                variant: "error",
            });
            return;
        }

        if (constraints && !constraints.trim()) {
            enqueueSnackbar("Constraints cannot be just whitespace.", {
                variant: "error",
            });
            return;
        }

        if (examples.length > 4) {
            enqueueSnackbar("Maximum 4 examples allowed.", {
                variant: "error",
            });
            return;
        }

        for (const [i, ex] of examples.entries()) {
            if (
                !ex.input.trim() ||
                !ex.output.trim() ||
                !ex.explanation.trim()
            ) {
                enqueueSnackbar(`Example ${i + 1} is incomplete.`, {
                    variant: "error",
                });
                return;
            }
        }

        if (publicTestCases.length < 1 || publicTestCases.length > 5) {
            enqueueSnackbar("Public test cases must be between 1 and 5.", {
                variant: "error",
            });
            return;
        }

        for (const [i, tc] of publicTestCases.entries()) {
            if (!tc.input.trim() || !tc.output.trim()) {
                enqueueSnackbar(`Public Test Case ${i + 1} is incomplete.`, {
                    variant: "error",
                });
                return;
            }
        }

        for (const [i, tc] of hiddenTestCases.entries()) {
            if (!tc.input.trim() || !tc.output.trim()) {
                enqueueSnackbar(`Hidden Test Case ${i + 1} is incomplete.`, {
                    variant: "error",
                });
                return;
            }
        }

        const data = {
            author,
            problemStatement,
            difficulty,
            topics,
            constraints,
            examples,
            publicTestCases,
            hiddenTestCases,
        };

        try {
            setLoading(true);
            await axios.put(`${BACKEND_URL}/questions/${id}`, data);
            enqueueSnackbar("Question updated successfully!", {
                variant: "success",
            });
            navigate("/");
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.message || "Update failed.", {
                variant: "error",
            });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderTestCasesAndExamples = (
        labelPrefix,
        cases,
        setCases,
        maxCount,
        labelFields = ["input", "output"]
    ) => {
        const handleDelete = (indexToDelete) => {
            setCases(cases.filter((_, i) => i !== indexToDelete));
        };

        return (
            <div className="space-y-4">
                {cases.map((tc, index) => (
                    <div
                        key={index}
                        className="relative mb-2 space-y-2 border-b pb-2 border-gray-300"
                    >
                        <p className="font-semibold text-gray-600">
                            {labelPrefix} {index + 1}
                        </p>

                        {labelFields.map((field) => (
                            <div key={field}>
                                <label className="block text-sm text-gray-500 mb-1 capitalize">
                                    {field}
                                </label>
                                <textarea
                                    value={tc[field]}
                                    onChange={(e) => {
                                        const updated = [...cases];
                                        updated[index][field] = e.target.value;
                                        setCases(updated);
                                    }}
                                    className="border-2 border-gray-300 px-2 py-1 w-full resize-y min-h-[80px] font-mono"
                                />
                            </div>
                        ))}

                        <button
                            className="absolute top-1 right-1 bg-red-200 hover:bg-red-300 px-2 py-1 text-sm rounded"
                            onClick={() => handleDelete(index)}
                            type="button"
                        >
                            Delete
                        </button>
                    </div>
                ))}

                {cases.length < maxCount && (
                    <button
                        onClick={() =>
                            setCases([
                                ...cases,
                                labelFields.reduce((obj, field) => {
                                    obj[field] = "";
                                    return obj;
                                }, {}),
                            ])
                        }
                        className="mt-2 bg-green-200 px-2 py-1 rounded hover:bg-green-300"
                        type="button"
                    >
                        + Add {labelPrefix}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl my-4">Edit Question</h1>
            {loading && <Spinner />}
            <div className="flex flex-col border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto">
                {/* title */}
                <div className="my-4">
                    <label className="text-xl text-gray-500 block mb-1">
                        Title <i>(cannot be edited) </i>
                    </label>
                    <p className="border-2 border-gray-300 px-4 py-2 rounded bg-gray-100 text-gray-700">
                        {title}
                    </p>
                </div>

                {/* Author */}
                <div className="my-4">
                    <label className="text-xl text-gray-500">Author</label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="border-2 border-gray-500 px-4 py-2 w-full"
                    />
                </div>

                {/* Problem Statement */}
                <div className="my-4">
                    <label className="text-xl text-gray-500 block mb-2">
                        Problem Statement
                    </label>
                    <textarea
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                        className="border-2 border-gray-500 px-4 py-2 w-full resize-y min-h-[120px]"
                        placeholder="Enter the problem statement here..."
                    />
                </div>

                {/* Constraints */}
                <div className="my-4">
                    <label className="text-xl text-gray-500 block mb-2">
                        Constraints
                    </label>
                    <textarea
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                        className="border-2 border-gray-500 px-4 py-2 w-full resize-y min-h-[100px]"
                        placeholder="e.g., 1 ≤ n ≤ 10⁹"
                    />
                </div>

                {/* Difficulty */}
                <div className="my-4">
                    <label className="text-xl text-gray-500">Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="border-2 border-gray-500 px-4 py-2 w-full"
                    >
                        {["noob", "easy", "medium", "hard", "god"].map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Topics */}
                <div className="my-4">
                    <label className="text-xl text-gray-500">
                        Topics (max 3)
                    </label>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {QUESTION_TOPICS.map((topic) => {
                            const disabled =
                                !topics.includes(topic) && topics.length >= 3;
                            return (
                                <label
                                    key={topic}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        value={topic}
                                        checked={topics.includes(topic)}
                                        disabled={disabled}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                if (topics.length < 3) {
                                                    setTopics([
                                                        ...topics,
                                                        topic,
                                                    ]);
                                                }
                                            } else {
                                                setTopics(
                                                    topics.filter(
                                                        (t) => t !== topic
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                    <span
                                        className={
                                            disabled
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }
                                    >
                                        {topic}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Examples */}
                <div className="my-4">
                    <label className="text-xl text-gray-500">Examples</label>
                    {renderTestCasesAndExamples(
                        "Example",
                        examples,
                        setExamples,
                        4,
                        ["input", "output", "explanation"]
                    )}
                </div>

                {/* Public Test Cases */}
                <div className="my-4">
                    <label className="text-xl text-gray-500">
                        Public Test Cases
                    </label>
                    {renderTestCasesAndExamples(
                        "Public Test Case",
                        publicTestCases,
                        setPublicTestCases,
                        5
                    )}
                </div>

                {/* Hidden Test Cases */}
                <div className="my-4">
                    <label className="text-xl text-gray-500">
                        Hidden Test Cases
                    </label>
                    {renderTestCasesAndExamples(
                        "Hidden Test Case",
                        hiddenTestCases,
                        setHiddenTestCases,
                        Infinity
                    )}
                </div>

                <button
                    className={`p-2 m-8 rounded transition ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-sky-300 hover:bg-sky-400"
                    }`}
                    onClick={handleUpdate}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
};

export default EditQuestion;
