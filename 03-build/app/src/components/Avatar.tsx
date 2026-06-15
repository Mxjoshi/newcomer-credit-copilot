// A user avatar: the uploaded picture if present, otherwise initials on a gradient.

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function Avatar({
  name,
  avatar,
  size = 40,
}: {
  name: string;
  avatar?: string;
  size?: number;
}) {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-700 font-bold text-white"
    >
      {initials(name)}
    </span>
  );
}
