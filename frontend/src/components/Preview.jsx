const Preview = ({ iframeUrl, setIframeUrl }) => {

    if (!iframeUrl) return null;

    return (
        <div className="flex min-w-96 flex-col h-full">

            <div className="address-bar">
                <input
                    type="text"
                    value={iframeUrl}
                    onChange={(e) => setIframeUrl(e.target.value)}
                    className="w-full p-2 px-4 bg-slate-200"
                />
            </div>

            <iframe
                src={iframeUrl}
                className="w-full h-full"
                title="Preview"
            />

        </div>
    );
};

export default Preview;