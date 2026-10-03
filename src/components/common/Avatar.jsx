export default function Avatar({ name = "", size = 44, src = null }) {
    const initials = name.trim().slice(0, 1).toUpperCase() || "?";

    return (
        <div
            className="avatar"
            style={{ width: size, height: size, fontSize: size * 0.42, overflow: "hidden" }}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                initials
            )}
        </div>
    );
}