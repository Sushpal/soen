const SidePanel = ({
    isOpen,
    onClose,
    collaborators
}) => {

    return (
        <div
            className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } top-0`}
        >
            <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
                <h1 className="font-semibold text-lg">
                    Collaborators
                </h1>

                <button
                    onClick={onClose}
                    className="p-2"
                >
                    <i className="ri-close-fill"></i>
                </button>
            </header>

            <div className="users flex flex-col gap-2">

                {collaborators?.map((collaborator) => (

                    <div
                        key={collaborator._id}
                        className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                    >

                        <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                            <i className="ri-user-fill absolute"></i>
                        </div>

                        <h1 className="font-semibold text-lg">
                            {collaborator.email}
                        </h1>

                    </div>

                ))}

            </div>

        </div>
    );
};

export default SidePanel;