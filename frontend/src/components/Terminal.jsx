const Terminal = ({ terminalRef, terminalOutput }) => {
    return (
        <div
            ref={terminalRef}
            className="terminal h-48 bg-slate-950 text-green-400 font-mono text-xs p-3 overflow-auto border-t-2 border-slate-700 flex-shrink-0"
        >
            <p className="text-slate-500 mb-1 text-xs">
                — terminal —
            </p>

            {terminalOutput.length === 0 && (
                <p className="text-slate-600">
                    Run your project to see output here...
                </p>
            )}

            {terminalOutput.map((line, index) => (
                <p
                    key={index}
                    className="whitespace-pre-wrap leading-5"
                >
                    {line}
                </p>
            ))}
        </div>
    );
};

export default Terminal;