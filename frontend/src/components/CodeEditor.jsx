import hljs from "highlight.js";
import Terminal from "./Terminal";

const CodeEditor = ({
    fileTree,
    currentFile,
    setCurrentFile,
    openFiles,
    saveFileTree,
    sendMessage,
    setFileTree,
    runProcessRef,
    setIsRunning,
    isRunning,
    startCommand,
    terminalOutput,
    setTerminalOutput,
    terminalRef,
    webContainerRef
}) => {

    const runProject = async () => {

        setTerminalOutput([]);

        if (runProcessRef.current) {
            runProcessRef.current.kill();
            runProcessRef.current = null;

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        await webContainerRef.current.mount(fileTree);

        const installProcess = await webContainerRef.current.spawn(
            "npm",
            ["install"]
        );

        installProcess.output.pipeTo(
            new WritableStream({
                write(chunk) {
                    setTerminalOutput(prev => [...prev, chunk]);
                }
            })
        );

        await installProcess.exit;

        const process = await webContainerRef.current.spawn(
            startCommand?.mainItem || "node",
            startCommand?.commands || ["app.js"]
        );

        process.output.pipeTo(
            new WritableStream({
                write(chunk) {
                    setTerminalOutput(prev => [...prev, chunk]);
                }
            })
        );

        runProcessRef.current = process;

        setIsRunning(true);
    };

    return (
        <div className="code-editor flex flex-col flex-grow h-full shrink">

            <div className="top flex justify-between w-full">

                <div className="files flex">

                    {openFiles.map(file => (

                        <button
                            key={file}
                            onClick={() => setCurrentFile(file)}
                            className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${
                                currentFile === file ? "bg-slate-400" : ""
                            }`}
                        >
                            <p className="font-semibold text-lg">
                                {file}
                            </p>
                        </button>

                    ))}

                </div>

                <div className="actions flex gap-2">

                    <button
                        onClick={runProject}
                        disabled={isRunning}
                        className="p-2 px-4 bg-slate-300 text-white disabled:opacity-50"
                    >
                        {isRunning ? "running..." : "run"}
                    </button>

                </div>

            </div>

            <div className="bottom flex flex-grow max-w-full shrink overflow-auto">

                {fileTree[currentFile] && (

                    <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">

                        <pre className="hljs h-full">

                            <code
                                className="hljs h-full outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {

                                    const updatedContent = e.target.innerText;

                                    const ft = {
                                        ...fileTree,
                                        [currentFile]: {
                                            file: {
                                                contents: updatedContent
                                            }
                                        }
                                    };

                                    setFileTree(ft);

                                    saveFileTree(ft);

                                    sendMessage("file-tree-update", {
                                        fileTree: ft
                                    });

                                }}
                                dangerouslySetInnerHTML={{
                                    __html: hljs.highlight(
                                        "javascript",
                                        fileTree[currentFile].file.contents
                                    ).value
                                }}
                                style={{
                                    whiteSpace: "pre-wrap",
                                    paddingBottom: "25rem"
                                }}
                            />

                        </pre>

                    </div>

                )}

            </div>

            <Terminal
                terminalRef={terminalRef}
                terminalOutput={terminalOutput}
            />

        </div>
    );
};

export default CodeEditor;