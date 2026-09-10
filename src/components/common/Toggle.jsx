import "./Toggle.css";

export default function Toggle({ checked, onChange, label }) {
    return (
        <label className="toggle">
            <span className="toggle__label">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                className={`toggle__track ${checked ? "is-on" : ""}`}
                onClick={() => onChange(!checked)}
            >
                <span className="toggle__thumb" />
            </button>
        </label>
    );
}