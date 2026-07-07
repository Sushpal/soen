import { useEffect, useRef } from "react";

const SyntaxHighlightedCode = (props) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && props.className?.includes("lang-") && window.hljs) {
            window.hljs.highlightElement(ref.current);
            ref.current.removeAttribute("data-highlighted");
        }
    }, [props.className, props.children]);

    return <code {...props} ref={ref} />;
};

export default SyntaxHighlightedCode;