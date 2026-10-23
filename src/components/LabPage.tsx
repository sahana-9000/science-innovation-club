
import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import "./LabPage.css";

type PartType = "battery" | "resistor" | "led" | "switch" | "capacitor";
type Side = "left" | "right";

type Part = {
  id: string;
  type: PartType;
  x: number;
  y: number;
  closed: boolean;
  voltage: number;
  resistance: number;
};

type Terminal = {
  partId: string;
  side: Side;
};

type Wire = {
  id: string;
  from: Terminal;
  to: Terminal;
};

const COMPONENTS: {
  type: PartType;
  name: string;
  symbol: string;
  description: string;
}[] = [
  { type: "battery", name: "Battery", symbol: "🔋", description: "9 V power source" },
  { type: "resistor", name: "Resistor", symbol: "〰", description: "220 Ω resistance" },
  { type: "led", name: "LED", symbol: "💡", description: "Light-emitting diode" },
  { type: "switch", name: "Switch", symbol: "⏻", description: "Open or close circuit" },
  { type: "capacitor", name: "Capacitor", symbol: "║", description: "Charge storage component" },
];

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function terminalKey(terminal: Terminal) {
  return `${terminal.partId}:${terminal.side}`;
}

function getTerminalPoint(terminal: Terminal, parts: Part[]) {
  const part = parts.find((item) => item.id === terminal.partId);
  if (!part) return null;

  return {
    x: part.x * 10 + (terminal.side === "left" ? -62 : 62),
    y: part.y * 6,
  };
}

function findCircuit(parts: Part[], wires: Wire[]) {
  const battery = parts.find((part) => part.type === "battery");
  if (!battery) {
    return { complete: false, hasLed: false, resistance: 0 };
  }

  const start = terminalKey({ partId: battery.id, side: "left" });
  const finish = terminalKey({ partId: battery.id, side: "right" });

  const graph = new Map<string, string[]>();
  const connect = (a: string, b: string) => {
    graph.set(a, [...(graph.get(a) ?? []), b]);
  };

  for (const part of parts) {
    const left = terminalKey({ partId: part.id, side: "left" });
    const right = terminalKey({ partId: part.id, side: "right" });

    // The battery provides voltage; it is not treated as a load.
    if (part.type === "battery" || part.type === "capacitor") continue;

    // An LED is directional in this simple introductory model.
    if (part.type === "led") {
      connect(left, right);
    } else if (part.type !== "switch" || part.closed) {
      connect(left, right);
      connect(right, left);
    }
  }

  for (const wire of wires) {
    const a = terminalKey(wire.from);
    const b = terminalKey(wire.to);
    connect(a, b);
    connect(b, a);
  }

  const queue = [start];
  const visited = new Set<string>([start]);
  const previous = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === finish) break;

    for (const next of graph.get(current) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      previous.set(next, current);
      queue.push(next);
    }
  }

  if (!visited.has(finish)) {
    return { complete: false, hasLed: false, resistance: 0 };
  }

  const pathNodes: string[] = [];
  let cursor = finish;

  while (cursor !== start) {
    pathNodes.push(cursor);
    const parent = previous.get(cursor);
    if (!parent) break;
    cursor = parent;
  }

  const pathPartIds = new Set(
    pathNodes.map((node) => node.split(":")[0]),
  );
  const pathParts = parts.filter((part) => pathPartIds.has(part.id));

  return {
    complete: true,
    hasLed: pathParts.some((part) => part.type === "led"),
    resistance: pathParts
  .filter((part) => part.type === "resistor")
  .reduce((total, part) => total + part.resistance, 0),
  };
}

export default function LabPage() {
  const boardRef = useRef<HTMLDivElement>(null);

  const [parts, setParts] = useState<Part[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(
    null,
  );
  const [notice, setNotice] = useState(
    "Drag a component onto the breadboard to get started.",
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const circuit = useMemo(() => findCircuit(parts, wires), [parts, wires]);

  const batteryVoltage =
  parts.find((part) => part.type === "battery")?.voltage ?? 9;

const current =
  circuit.complete && circuit.resistance > 0
    ? Math.max(
        0,
        (batteryVoltage - (circuit.hasLed ? 2 : 0)) /
          circuit.resistance,
      )
    : 0;

  const ledOn = circuit.complete && circuit.hasLed && current > 0;

  function addPart(type: PartType, x?: number, y?: number) {
    
    const part: Part = {
  id: makeId(),
  type,
  x: x ?? clamp(24 + ((parts.length * 13) % 52), 10, 90),
  y: y ?? clamp(20 + ((parts.length * 17) % 58), 12, 88),
  closed: false,
  voltage: 9,
  resistance: 220,
};

    setParts((previous) => [...previous, part]);
    setNotice(`${COMPONENTS.find((item) => item.type === type)?.name} added. Connect its terminals.`);
  }

  function removePart(id: string) {
    setParts((previous) => previous.filter((part) => part.id !== id));
    setWires((previous) =>
      previous.filter(
        (wire) => wire.from.partId !== id && wire.to.partId !== id,
      ),
    );
    setSelectedTerminal((previous) => previous?.partId === id ? null : previous);
    setNotice("Component removed.");
  }

  function clearBoard() {
    setParts([]);
    setWires([]);
    setSelectedTerminal(null);
    setNotice("Breadboard cleared. Add components to build a new circuit.");
  }

  function handleTerminalClick(terminal: Terminal) {
    if (!parts.some((part) => part.id === terminal.partId)) return;

    if (!selectedTerminal) {
      setSelectedTerminal(terminal);
      setNotice("Terminal selected. Now click a different component terminal.");
      return;
    }

    if (
      selectedTerminal.partId === terminal.partId &&
      selectedTerminal.side === terminal.side
    ) {
      setSelectedTerminal(null);
      setNotice("Terminal selection cancelled.");
      return;
    }

    if (selectedTerminal.partId === terminal.partId) {
      setNotice("Choose a terminal on a different component.");
      return;
    }

    const duplicate = wires.some(
      (wire) =>
        (terminalKey(wire.from) === terminalKey(selectedTerminal) &&
          terminalKey(wire.to) === terminalKey(terminal)) ||
        (terminalKey(wire.to) === terminalKey(selectedTerminal) &&
          terminalKey(wire.from) === terminalKey(terminal)),
    );

    if (duplicate) {
      setSelectedTerminal(null);
      setNotice("Those terminals are already connected.");
      return;
    }

    setWires((previous) => [
      ...previous,
      { id: makeId(), from: selectedTerminal, to: terminal },
    ]);
    setSelectedTerminal(null);
    setNotice("Wire connected. Keep wiring components to complete the circuit.");
  }

  function handleDragStart(event: DragEvent, value: string) {
    event.dataTransfer.setData("text/plain", value);
    event.dataTransfer.effectAllowed = "move";
    setDraggedItem(value);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const value = event.dataTransfer.getData("text/plain");
    const board = boardRef.current;
    if (!board || !value) return;

    const rect = board.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 9, 91);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 12, 88);

    if (value.startsWith("part:")) {
      const id = value.slice(5);
      setParts((previous) =>
        previous.map((part) => part.id === id ? { ...part, x, y } : part),
      );
      setNotice("Component moved.");
    } else if (COMPONENTS.some((component) => component.type === value)) {
      addPart(value as PartType, x, y);
    }

    setDraggedItem(null);
  }

  function toggleSwitch(id: string) {
    setParts((previous) =>
      previous.map((part) =>
        part.id === id ? { ...part, closed: !part.closed } : part,
      ),
    );
    setNotice("Switch state changed.");
  }

  return (
    <main className="lab-page">
      <header className="lab-header">
        <a className="lab-back-link" href={import.meta.env.BASE_URL}>
          <span aria-hidden="true">←</span> Club home
        </a>

        <div className="lab-brand">
          <span className="lab-brand-mark">S<span>+</span>I</span>
          <span>SCIENCE & INNOVATION CLUB</span>
        </div>

        <div className="lab-header-tag">
          <span className="lab-live-dot" />
          VIRTUAL LAB
        </div>
      </header>

      <section className="lab-intro">
        <div className="lab-eyebrow">
          <span /> INTERACTIVE EXPERIMENTS / 001
        </div>
        <h1>Build. Connect. <span>Discover.</span></h1>
        <p>
          Explore basic circuits by placing components, connecting terminals,
          and observing how a simple circuit responds.
        </p>
      </section>

      <section className="lab-workspace">
        <aside className="lab-sidebar">
          <div className="lab-panel-heading">
            <div>
              <span className="lab-section-kicker">YOUR TOOLKIT</span>
              <h2>Components</h2>
            </div>
            <span className="lab-count">{parts.length} placed</span>
          </div>

          <p className="lab-helper">
            Drag a component onto the board, or click its button to add it.
          </p>

          <div className="lab-component-list">
            {COMPONENTS.map((component) => (
              <div
                className="lab-component-option"
                key={component.type}
                draggable
                onDragStart={(event) => handleDragStart(event, component.type)}
                onDragEnd={() => setDraggedItem(null)}
              >
                <div className={`lab-component-symbol ${component.type}`}>
                  {component.symbol}
                </div>
                <div className="lab-component-copy">
                  <strong>{component.name}</strong>
                  <span>{component.description}</span>
                </div>
                <button
                  type="button"
                  className="lab-add-button"
                  onClick={() => addPart(component.type)}
                  aria-label={`Add ${component.name}`}
                  title={`Add ${component.name}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>

          <div className="lab-sidebar-tip">
            <span className="lab-tip-icon">✳</span>
            <div>
              <strong>Quick tip</strong>
              <p>Click a terminal dot, then click a terminal on another component to connect them.</p>
            </div>
          </div>

          <button className="lab-clear-button" type="button" onClick={clearBoard}>
            ↻ Clear breadboard
          </button>
        </aside>

        <section className="lab-board-panel">
          <div className="lab-board-toolbar">
            <div>
              <span className="lab-section-kicker">WORKSPACE / 01</span>
              <h2>Virtual breadboard</h2>
            </div>
            <div className={`lab-status-pill ${circuit.complete ? "complete" : ""}`}>
              <span />
              {circuit.complete ? "Path detected" : "Ready to build"}
            </div>
          </div>

          <div
            className={`lab-breadboard ${draggedItem ? "drag-active" : ""}`}
            ref={boardRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="lab-board-label lab-board-label-top">
              <span>+</span> POWER RAIL
            </div>
            <div className="lab-board-label lab-board-label-bottom">
              <span>−</span> GROUND RAIL
            </div>

            <div className="lab-board-rail lab-board-rail-top" />
            <div className="lab-board-rail lab-board-rail-bottom" />

            <div className="lab-board-holes" aria-hidden="true">
              {Array.from({ length: 13 }, (_, row) => (
                <div className="lab-hole-row" key={row}>
                  {Array.from({ length: 27 }, (_, col) => (
                    <span className="lab-hole" key={col} />
                  ))}
                </div>
              ))}
            </div>

            <svg
              className="lab-wire-layer"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              aria-label="Circuit wires"
            >
              {wires.map((wire) => {
                const from = getTerminalPoint(wire.from, parts);
                const to = getTerminalPoint(wire.to, parts);
                if (!from || !to) return null;

                const bend = Math.max(24, Math.abs(to.x - from.x) * 0.35);
                const direction = to.x >= from.x ? 1 : -1;

                return (
                  <g key={wire.id}>
                    <path
                      className="lab-wire-shadow"
                      d={`M ${from.x} ${from.y} C ${from.x + bend * direction} ${from.y}, ${to.x - bend * direction} ${to.y}, ${to.x} ${to.y}`}
                    />
                    <path
                      className="lab-wire-line"
                      d={`M ${from.x} ${from.y} C ${from.x + bend * direction} ${from.y}, ${to.x - bend * direction} ${to.y}, ${to.x} ${to.y}`}
                    />
                  </g>
                );
              })}
            </svg>

            {parts.map((part) => {
              const component = COMPONENTS.find((item) => item.type === part.type)!;
              const leftTerminal: Terminal = { partId: part.id, side: "left" };
              const rightTerminal: Terminal = { partId: part.id, side: "right" };

              return (
                <div
                  key={part.id}
                  className={`lab-placed-part ${part.type} ${part.type === "switch" && part.closed ? "switch-closed" : ""}`}
                  style={{ left: `${part.x}%`, top: `${part.y}%` }}
                  draggable
                  onDragStart={(event) => handleDragStart(event, `part:${part.id}`)}
                  onDragEnd={() => setDraggedItem(null)}
                >
                  <button
                    type="button"
                    className={`lab-terminal left ${selectedTerminal && terminalKey(selectedTerminal) === terminalKey(leftTerminal) ? "selected" : ""}`}
                    aria-label={`Left terminal of ${component.name}`}
                    title="Connect terminal"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTerminalClick(leftTerminal);
                    }}
                  />
                  <div className="lab-part-body">
                    <span className="lab-part-symbol">
                      {part.type === "led" && ledOn ? "💡" : component.symbol}
                    </span>
                    <strong>{component.name}</strong>
                    {part.type === "battery" && (
  <label className="lab-value-control">
    <input
      aria-label="Battery voltage"
      type="number"
      min="0.1"
      max="1000"
      step="0.1"
      value={part.voltage}
      draggable={false}
      onDragStart={(event) => event.stopPropagation()}
      onChange={(event) => {
        const value = Number(event.target.value);
        if (!Number.isFinite(value) || value <= 0 || value > 1000) return;
        setParts((previous) =>
          previous.map((item) =>
            item.id === part.id ? { ...item, voltage: value } : item,
          ),
        );
      }}
    />
    <span>V</span>
  </label>
)}

{part.type === "resistor" && (
  <label className="lab-value-control">
    <input
      aria-label="Resistor resistance"
      type="number"
      min="1"
      max="10000000"
      step="10"
      value={part.resistance}
      draggable={false}
      onDragStart={(event) => event.stopPropagation()}
      onChange={(event) => {
        const value = Number(event.target.value);
        if (!Number.isFinite(value) || value < 1 || value > 10000000) return;
        setParts((previous) =>
          previous.map((item) =>
            item.id === part.id ? { ...item, resistance: value } : item,
          ),
        );
      }}
    />
    <span>Ω</span>
  </label>
)}
                    {part.type === "led" && <small>{ledOn ? "ON" : "LED"}</small>}
                    {part.type === "switch" && (
                      <button
                        type="button"
                        className="lab-switch-toggle"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSwitch(part.id);
                        }}
                      >
                        {part.closed ? "Closed" : "Open"}
                      </button>
                    )}
                    {part.type === "capacitor" && <small>Capacitor</small>}
                  </div>
                  <button
                    type="button"
                    className={`lab-terminal right ${selectedTerminal && terminalKey(selectedTerminal) === terminalKey(rightTerminal) ? "selected" : ""}`}
                    aria-label={`Right terminal of ${component.name}`}
                    title="Connect terminal"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTerminalClick(rightTerminal);
                    }}
                  />
                  <button
                    type="button"
                    className="lab-remove-part"
                    aria-label={`Remove ${component.name}`}
                    title="Remove component"
                    onClick={() => removePart(part.id)}
                    draggable={false}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {parts.length === 0 && (
              <div className="lab-empty-state">
                <div className="lab-empty-icon">⌁</div>
                <strong>Your circuit starts here</strong>
                <span>Drag a component from the left panel onto this board.</span>
              </div>
            )}

            {selectedTerminal && (
              <div className="lab-connect-hint">
                Select a terminal on another component
                <button type="button" onClick={() => setSelectedTerminal(null)}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="lab-board-footer">
            <span><i className="lab-legend-dot wire" /> Connected wire</span>
            <span><i className="lab-legend-dot terminal" /> Component terminal</span>
            <span className="lab-footer-note">Drag components to reposition</span>
          </div>

          <div className="lab-notice" role="status">
            <span className="lab-notice-icon">i</span>
            {notice}
          </div>
        </section>
      </section>

      <section className="lab-readouts">
        <div className="lab-readout-card">
          <span className="lab-readout-label">POWER SOURCE</span>
          <strong>{batteryVoltage} <small>V</small></strong>
          <span className="lab-readout-foot">Default battery voltage</span>
        </div>
        <div className="lab-readout-card">
          <span className="lab-readout-label">ESTIMATED CURRENT</span>
          <strong>{(current * 1000).toFixed(1)} <small>mA</small></strong>
          <span className="lab-readout-foot">
            {circuit.complete ? "Simplified circuit estimate" : "Complete a path to calculate"}
          </span>
        </div>
        <div className="lab-readout-card">
          <span className="lab-readout-label">WIRES CONNECTED</span>
          <strong>{wires.length.toString().padStart(2, "0")}</strong>
          <span className="lab-readout-foot">Terminal-to-terminal links</span>
        </div>
        <div className="lab-readout-card">
          <span className="lab-readout-label">CIRCUIT STATUS</span>
          <strong className={`lab-status-readout ${circuit.complete ? "is-complete" : ""}`}>
            {circuit.complete ? "ACTIVE" : "OPEN"}
          </strong>
          <span className="lab-readout-foot">
            {ledOn ? "LED path detected" : "Build a complete path"}
          </span>
        </div>
      </section>

      <footer className="lab-footer">
        <span>SCIENCE & INNOVATION CLUB</span>
        <span>LEARN BY EXPERIMENTING <b>✳</b></span>
      </footer>
    </main>
  );
}
