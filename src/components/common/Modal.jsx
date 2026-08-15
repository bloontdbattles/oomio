import { useEffect } from "react";
import "./Modal.css";

export default function Modal({ isOpen, onClose, children }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal__overlay" onClick={onClose}>
            <div
                className="modal__panel"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}