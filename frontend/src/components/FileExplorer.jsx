const FileExplorer = ({
    fileTree,
    currentFile,
    setCurrentFile,
    openFiles,
    setOpenFiles
}) => {

    const openFile = (file) => {
        setCurrentFile(file);
        setOpenFiles([...new Set([...openFiles, file])]);
    };

    return (
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
            <div className="file-tree w-full">

                {Object.keys(fileTree).map((file) => (

                    <button
                        key={file}
                        onClick={() => openFile(file)}
                        className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
                    >
                        <p className="font-semibold text-lg">
                            {file}
                        </p>
                    </button>

                ))}

            </div>
        </div>
    );
};

export default FileExplorer;