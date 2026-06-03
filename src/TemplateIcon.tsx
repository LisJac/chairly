import type { TemplateId } from "./types"

// Colored icon tiles for each template — matches chairly-vorlagen-uebersicht.svg
export default function TemplateIcon({ id, size = 32 }: { id: TemplateId; size?: number }) {
  const s = size
  const stroke = Math.max(2, size / 7.5)
  const common = {
    width: s,
    height: s,
    viewBox: "0 0 100 100",
    style: { display: "inline-block", flexShrink: 0 } as React.CSSProperties,
  }

  // Each icon: colored rounded square + white iconography
  switch (id) {
    case "grow":
      // Kurt — target with arrow (green)
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#639922" />
          <g fill="none" stroke="#fff" strokeWidth={stroke * 1.4} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="53" r="23" />
            <circle cx="50" cy="53" r="12.5" />
            <circle cx="50" cy="53" r="3.5" fill="#fff" />
            <path d="M74 29 L57 46" />
            <path d="M64 45 L57 46 L58 53" />
          </g>
        </svg>
      )
    case "three_field":
      // Offener Austausch — chat bubble exchange (blue)
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#378ADD" />
          <g fill="none" stroke="#fff" strokeWidth={stroke * 1.4} strokeLinecap="round" strokeLinejoin="round">
            <rect x="22" y="24" width="42" height="28" rx="8" />
            <path d="M33 52 L33 62 L45 52" />
            <rect x="42" y="44" width="34" height="24" rx="8" fill="#378ADD" />
            <path d="M64 68 L64 76 L54 68" />
          </g>
        </svg>
      )
    case "konsent":
      // Konsent-Entscheid — double checkmark (green)
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#1D9E75" />
          <g fill="none" stroke="#fff" strokeWidth={stroke * 1.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 52 L31 63 L52 40" />
            <path d="M44 60 L48 64 L74 34" />
          </g>
        </svg>
      )
    case "systemic_condensing":
      // Systemisches Konsensieren — gauge/dial (brown)
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#BA7517" />
          <g fill="none" stroke="#fff" strokeWidth={stroke * 1.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 64 A26 26 0 0 1 76 64" />
            <line x1="50" y1="64" x2="64" y2="44" />
            <circle cx="50" cy="64" r="4.5" fill="#fff" />
            <line x1="26" y1="64" x2="30" y2="64" />
            <line x1="70" y1="64" x2="74" y2="64" />
          </g>
        </svg>
      )
    case "basic_info":
      // Kurzes Update — megaphone (red/orange)
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#D85A30" />
          <g fill="none" stroke="#fff" strokeWidth={stroke * 1.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 44 L50 36 L50 64 L28 56 Z" />
            <line x1="37" y1="58" x2="37" y2="69" />
            <path d="M58 41 Q66 50 58 59" />
            <path d="M65 35 Q78 50 65 65" />
          </g>
        </svg>
      )
    case "question_topic":
      // Frage & Thema — robot (dark)
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#444441" />
          <g fill="none" stroke="#fff" strokeWidth={stroke * 1.4} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="42" r="18" />
            <line x1="46" y1="40" x2="46" y2="50" />
            <line x1="54" y1="40" x2="54" y2="50" />
            <line x1="43" y1="64" x2="57" y2="64" />
            <line x1="45" y1="70" x2="55" y2="70" />
            <line x1="43" y1="64" x2="45" y2="70" />
            <line x1="57" y1="64" x2="55" y2="70" />
          </g>
        </svg>
      )
    case "none":
    default:
      // No template — neutral dashed circle
      return (
        <svg {...common}>
          <rect width="100" height="100" rx="22" fill="#EFEBE2" />
          <g fill="none" stroke="#9C9890" strokeWidth={stroke * 1.4} strokeLinecap="round">
            <line x1="32" y1="50" x2="68" y2="50" />
          </g>
        </svg>
      )
  }
}
