type Fragment = string | RegExp | (() => string) | (() => RegExp);

function Escape(v: Fragment): string {
  if (typeof v === "string") return v;
  else if (v instanceof RegExp) return v.source;
  return Escape(v());
}

function All(...v: Fragment[]) {
  if (v.length === 1) return Escape(v[0]);
  else return `(?:${v.map(Escape).join("")})`;
}

function Capture(...v: Fragment[]) {
  return `(${v.map(Escape).join("")})`;
}

function Any(...v: Fragment[]) {
  if (v.length === 1) return Escape(v[0]);
  return `(?:${v.map(Escape).join("|")})`;
}

function Optional(...v: Fragment[]) {
  return `${All(...v)}?`;
}
function Repeat(...v: Fragment[]) {
  return `${All(...v)}*`;
}
function AtleastOnce(...v: Fragment[]) {
  return `${All(...v)}+`;
}

const WS = /\s*/;
const Identifier = /[a-zA-Z_][a-zA-Z0-9_]*/;
const TypeParamList = All(
  "<",
  WS,
  Optional(WS, Identifier, Repeat(WS, ",", WS, Identifier)),
  WS,
  ">"
);

const syntax = {
  name: "flat",
  patterns: [
    { include: "#module_declaration" },
    { include: "#struct_declaration" },
    { include: "#constraint_declaration" },
  ],
  repository: {
    module_declaration: {
      name: "meta.declaration.module.flat",

      match: All(
        Capture("module"),
        WS,
        Capture(Identifier, Repeat(/\./, Identifier))
      ),

      captures: {
        1: { name: "storage.type.module.flat" },
        2: { name: "entity.name.module.flat" },
      },
    },

    struct_declaration: {
      name: "meta.declaration.struct.flat",

      begin: All(
        Capture("struct"),
        WS,
        Capture(Identifier),
        WS,
        Optional(Capture(TypeParamList)),
        WS,
        "{"
      ),

      beginCaptures: {
        1: { name: "storage.type.struct.flat" },
        2: { name: "entity.name.struct.flat" },
        3: {
          patterns: [
            { name: "entity.name.type.flat", match: Capture(Identifier) },
          ],
        },
      },

      end: "}",
    },

    constraint_declaration: {
      name: "meta.declaration.constraint.flat",

      begin: All(
        Capture("constraint"),
        WS,
        Capture(Identifier),
        WS,
        Optional(Capture(TypeParamList)),
        WS,
        "{"
      ),

      beginCaptures: {
        1: { name: "storage.type.constraint.flat" },
        2: { name: "entity.name.constraint.flat" },
        3: {
          patterns: [
            { name: "entity.name.type.flat", match: Capture(Identifier) },
          ],
        },
      },

      end: "}",
    },
  },
  scopeName: "source.flat",
};

console.log(JSON.stringify(syntax, null, "  "));