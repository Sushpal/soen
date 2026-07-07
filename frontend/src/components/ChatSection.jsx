const ChatSection = ({
    messages,
    user,
    message,
    setMessage,
    send,
    messageBox,
    isAiTyping,
    WriteAiMessage,
    setIsModalOpen,
    isSidePanelOpen,
    setIsSidePanelOpen,
    children
}) => {
    return (
        <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">

            <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
                <button
                    className="flex gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <i className="ri-add-fill mr-1"></i>
                    <p>Add collaborator</p>
                </button>

                <button
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                    className="p-2"
                >
                    <i className="ri-group-fill"></i>
                </button>
            </header>

            <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">

                <div
                    ref={messageBox}
                    className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`${msg.sender._id === "ai" ? "max-w-80" : "max-w-52"} ${
                                String(msg.sender._id) === String(user?._id)
                                    ? "ml-auto"
                                    : ""
                            } message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
                        >
                            <small className="opacity-65 text-xs">
                                {msg.sender.email}
                            </small>

                            <div className="text-sm">
                                {msg.sender._id === "ai"
                                    ? WriteAiMessage(msg.message)
                                    : <p>{msg.message}</p>}
                            </div>
                        </div>
                    ))}

                    {isAiTyping && (
                        <div className="message flex flex-col p-2 bg-slate-50 w-fit rounded-md max-w-52">
                            <small className="opacity-65 text-xs">
                                AI
                            </small>

                            <p className="text-sm text-slate-500 animate-pulse">
                                thinking...
                            </p>
                        </div>
                    )}
                </div>

                <div className="inputField w-full flex absolute bottom-0">

                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Enter message"
                        className="p-2 px-4 border-none outline-none flex-grow"
                    />

                    <button
                        onClick={send}
                        className="px-5 bg-slate-950 text-white"
                    >
                        <i className="ri-send-plane-fill"></i>
                    </button>

                </div>

            </div>

            {children}

        </section>
    );
};

export default ChatSection;