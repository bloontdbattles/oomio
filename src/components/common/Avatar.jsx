export default function Avatar({ name = "", size = 44 }) {
    const initials = name.trim().slice(0, 1).toUpperCase() || "?";

    return (
        <div
            className="avatar"
            style={{ width: size, height: size, fontSize: size * 0.42 }}
        >
            {initials}
        </div>
    );
}