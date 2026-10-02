import "./Toggle.css";

export default function Toggle({ checked, onChange, label, icon }) {
    return (
        <label className="toggle">
            <span className="toggle__label">
                {icon && <img src={icon} alt="" className="toggle__icon" />}
                {label}
            </span>
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