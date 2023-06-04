export class Fragment {
  constructor(public pattern: string) {}

  toString() {
    return this.pattern;
  }

  toJSON() {
    return this.pattern;
  }
}

function Escape(value: string | RegExp | Fragment): string {
  if (typeof value === "string")
    return `(?:${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`;
  else if (value instanceof RegExp) return `(?:${value.source})`;
  else return value.pattern;
}

export function All(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?:${v.map(Escape).join("")})`);
}

export function Capture(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(${v.map(Escape).join("")})`);
}

export function Any(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?:${v.map(Escape).join("|")})`);
}

export function Lookahead(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?=${All(...v)})`);
}

export function NegativeLookahead(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?!${All(...v)})`);
}

export function Lookbehind(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?<=${All(...v)})`);
}

export function NegativeLookbehind(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?<!${All(...v)})`);
}

export function Optional(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?:${All(...v)}?)`);
}

export function Repeat(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?:${All(...v)}*)`);
}

export function AtleastOnce(...v: (string | RegExp | Fragment)[]) {
  return new Fragment(`(?:${All(...v)}+)`);
}
