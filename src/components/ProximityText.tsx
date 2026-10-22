
import { useRef } from "react";

type ProximityTextProps = {
  text: string;
  className?: string;
};

export default function ProximityText({
  text,
  className = "",
}: ProximityTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  function handlePointerMove(
    event: React.PointerEvent<HTMLSpanElement>,
  ) {
    // Only run the proximity effect for a mouse.
    if (event.pointerType !== "mouse") return;

    const container = containerRef.current;
    if (!container) return;

    const letters = container.querySelectorAll<HTMLElement>(
      ".proximity-letter",
    );

    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const radius = 90;

    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.hypot(
        pointerX - centerX,
        pointerY - centerY,
      );

      const intensity = Math.max(0, 1 - distance / radius);

      letter.style.setProperty(
        "--proximity",
        intensity.toFixed(3),
      );
    });
  }

  function handlePointerLeave() {
    const container = containerRef.current;
    if (!container) return;

    container
      .querySelectorAll<HTMLElement>(".proximity-letter")
      .forEach((letter) => {
        letter.style.setProperty("--proximity", "0");
      });
  }

  return (
    <span
      ref={containerRef}
      className={`proximity-text ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="sr-only">{text}</span>
      
        <span aria-hidden="true">
        {text.split(/(\s+)/).map((word, wordIndex) =>
            /^\s+$/.test(word) ? (
            <span key={`space-${wordIndex}`}>{word}</span>
            ) : (
            <span className="proximity-word" key={`word-${wordIndex}`}>
                {Array.from(word).map((character, index) => (
                <span
                    className="proximity-letter"
                    key={`${wordIndex}-${index}`}
                >
                    {character}
                </span>
                ))}
            </span>
            ),
        )}
        </span>
      </span>
  );
}
