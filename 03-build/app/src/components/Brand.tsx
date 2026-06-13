// The product mark: a gradient rounded square with a stylized checkmark-shield glyph. Used in
// the header and the hero. Purely decorative, no state.

export default function Brand({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 text-white shadow-sm shadow-indigo-500/30"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.5l7.5 3v5.5c0 4.6-3.1 8.3-7.5 10-4.4-1.7-7.5-5.4-7.5-10V5.5z" />
        <path d="M8.5 12l2.5 2.5 4.5-5" />
      </svg>
    </span>
  );
}
