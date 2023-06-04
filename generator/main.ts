import type { TmLanguage } from "./tmLanguage.types";
import {
  All,
  Any,
  AtleastOnce,
  Capture,
  Lookahead,
  Lookbehind,
  NegativeLookahead,
  NegativeLookbehind,
  Optional,
  Repeat,
} from "./builder";

const WS = All(/\s*/);
const Identifier = All(/[a-zA-Z_][a-zA-Z0-9_]*/);
const TypeParamList = All(
  "<",
  WS,
  Optional(WS, Identifier, Repeat(WS, ",", WS, Identifier)),
  WS,
  ">"
);

// TODO: Find out if end expressions are matched immediately

const syntax: TmLanguage = {
  $schema:
    "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  name: "flat",
  patterns: [
    { include: "#module_declaration" },
    { include: "#struct_declaration" },
    { include: "#constraint_declaration" },
    { include: "#function_declaration" },
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
        2: { name: "entity.name.type.struct.flat" },
        3: {
          patterns: [
            { name: "entity.name.type.flat", match: Capture(Identifier) },
          ],
        },
      },
      patterns: [
        {
          begin: Identifier,
          beginCaptures: {
            0: { name: "variable.other.flat" },
          },
          patterns: [
            {
              begin: All(":"),
              patterns: [{ include: "#type" }],
              end: Lookahead(Any(",", "}")),
            },
          ],
          end: Lookahead(Any(",", "}")),
        },
      ],
      end: All("}"),
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
        2: { name: "entity.name.type.constraint.flat" },
        3: {
          patterns: [
            { name: "entity.name.type.flat", match: Capture(Identifier) },
          ],
        },
      },
      patterns: [
        {
          name: "meta.declaration.constraint.condition.flat",
          begin: All("fn"),
          beginCaptures: {
            0: { name: "storage.type.function.flat" },
          },
          patterns: [
            {
              name: "meta.declaration.constraint.condition.parameters.flat",
              begin: All("("),
              patterns: [
                {
                  begin: Identifier,
                  beginCaptures: {
                    0: { name: "variable.parameter.flat" },
                  },
                  patterns: [{ include: "#type" }],
                  end: Lookahead(Any(",", ")")),
                },
              ],
              end: All(")"),
            },
            {
              name: "meta.declaration.constraint.condition.name.flat",
              patterns: [
                {
                  name: "entity.name.function.flat",
                  match: Identifier,
                },
              ],
            },
            {
              name: "meta.declaration.constraint.condition.result.flat",
              begin: All(":"),
              patterns: [{ include: "#type" }],
              end: Lookahead(Any(",", "}")),
            },
          ],
          end: Lookahead(Any(",", "}")),
        },
      ],
      end: All("}"),
    },

    function_declaration: {
      name: "meta.declaration.function.flat",
      begin: All(Capture("fn")),
      beginCaptures: {
        1: { name: "storage.type.function.flat" },
      },

      patterns: [
        {
          name: "meta.declaration.function.typeparams.flat",
          begin: All("<"),
          patterns: [
            {
              name: "entity.name.type.flat",
              match: Capture(Identifier),
            },
          ],
          end: All(">"),
        },
        {
          name: "meta.declaration.function.requirements.flat",
          begin: All("["),
          patterns: [
            {
              begin: All(Capture(Identifier), WS, "<"),
              beginCaptures: {
                1: { name: "entity.name.type.constraint.flat" },
              },
              patterns: [{ include: "#type" }, { match: All(",") }],
              end: All(">"),
            },
          ],
          end: All("]"),
        },
        {
          name: "meta.declaration.function.parameters.flat",
          begin: All("("),
          patterns: [
            {
              begin: All(Capture(Identifier)),
              beginCaptures: {
                1: { name: "variable.parameter.flat" },
              },
              patterns: [{ match: All(":") }, { include: "#type" }],
              end: Any(",", Lookahead(")")),
            },
          ],
          end: All(")"),
        },
        {
          name: "meta.declaration.function.body.flat",
          begin: Lookahead("{"),
          patterns: [{ include: "#block_statement" }],
          end: Lookbehind("}"),
        },
        {
          name: "entity.name.function.flat",
          match: Identifier,
        },
        {
          name: "meta.declaration.function.result.flat",
          begin: All(":"),
          patterns: [{ include: "#type" }],
          end: Lookahead("{"),
        },
      ],

      end: Lookbehind("}"),
    },

    type: {
      name: "meta.type.flat",
      begin: Capture(Identifier),
      beginCaptures: {
        1: { name: "entity.name.type.flat" },
      },
      patterns: [
        {
          begin: All("<"),
          patterns: [{ include: "#type" }, { match: All(",") }],
          end: All(">"),
        },
        {
          match: AtleastOnce(Any("*", "[]")),
        },
      ],
      end: NegativeLookahead(WS, Any("<", "*", "[]")),
    },

    statement: {
      patterns: [
        { include: "#block_statement" },
        { include: "#variable_statement" },
        { include: "#return_statement" },
        { include: "#if_statement" },
        { include: "#while_statement" },
        { include: "#expression_statement" },
      ],
    },

    block_statement: {
      name: "meta.statement.block.flat",
      begin: All("{"),
      patterns: [{ include: "#statement" }],
      end: All("}"),
    },

    variable_statement: {
      name: "meta.statement.variable.flat",
      begin: All("let"),
      beginCaptures: {
        0: { name: "storage.type.let.flat" },
      },
      patterns: [
        {
          begin: All(Capture(Identifier), WS, "="),
          beginCaptures: { 1: { name: "variable.other.flat" } },
          patterns: [
            {
              include: "#expression",
            },
          ],
          end: NegativeLookbehind(Identifier, WS, "="),
        },
      ],
      end: NegativeLookahead(WS, Identifier, WS, "="),
    },

    return_statement: {
      name: "meta.statement.return.flat",
      begin: All("return"),
      beginCaptures: {
        0: { name: "keyword.control.return.flat" },
      },
      patterns: [{ include: "#expression" }],
      end: NegativeLookbehind("return"),
    },

    if_statement: {
      name: "meta.statement.if.flat",
      begin: All("if"),
      beginCaptures: {
        0: { name: "keyword.control.if.flat" },
      },
      patterns: [
        {
          begin: All("("),
          patterns: [{ include: "#expression" }],
          end: All(")"),
        },
        {
          begin: All("else"),
          patterns: [{ include: "#statement" }],
          end: NegativeLookbehind("else"),
        },
        { include: "#statement" },
      ],
      end: All(
        NegativeLookbehind(Any("if", ")")),
        NegativeLookahead(Any("(", "else"))
      ),
    },

    while_statement: {
      name: "meta.statement.while.flat",
      begin: All("while"),
      beginCaptures: {
        0: { name: "keyword.control.while.flat" },
      },
      patterns: [
        {
          begin: All("("),
          patterns: [{ include: "#expression" }],
          end: All(")"),
        },
        { include: "#statement" },
      ],
      end: All(NegativeLookbehind(Any("while", ")"))),
    },

    expression_statement: {
      patterns: [{ include: "#expression" }],
    },

    expression: {
      patterns: [{ include: "#L10" }],
    },

    L0: {
      name: "meta.expression.L0.flat",
      patterns: [
        {
          name: "meta.expression.group.flat",
          begin: All("("),
          patterns: [{ include: "#expression" }],
          end: All(")"),
        },
        {
          name: "meta.expression.integer.flat",
          match: All(
            Capture(
              Any(
                All("0b", AtleastOnce(/[0-1]/)),
                All("0x", AtleastOnce(/[0-9a-fA-F]/)),
                All(AtleastOnce(/[0-9]/))
              )
            ),
            Capture(
              Optional(
                Any("u8", "u16", "u32", "u64", "i8", "i16", "i32", "i64")
              )
            )
          ),
          captures: {
            1: { name: "constant.numeric.flat" },
            2: { name: "keyword.operator.flat" },
          },
        },
        {
          name: "meta.expression.bool.flat",
          match: Capture(Any("true", "false")),
          captures: {
            1: { name: "constant.language.flat" },
          },
        },
        {
          name: "string.quoted.single.flat",
          begin: All("'"),
          end: All(NegativeLookbehind("\\"), "'"),
        },
        {
          name: "string.quoted.double.flat",
          begin: All('"'),
          end: All(NegativeLookbehind("\\"), '"'),
        },
        {
          name: "meta.expression.identifier.flat",
          begin: Identifier,
          patterns: [
            {
              begin: All("<"),
              patterns: [{ include: "#type" }],
              end: All(">"),
            },
            {
              begin: All("{"),
              patterns: [
                {
                  name: "meta.expression.struct.flat",
                  begin: Capture(Identifier),
                  beginCaptures: {
                    1: { name: "variable.other.flat" },
                  },
                  patterns: [
                    {
                      begin: All(":"),
                      patterns: [{ include: "#expression" }],
                      end: Lookahead(Any(",", "}")),
                    },
                  ],
                  end: Lookahead(Any(",", "}")),
                },
              ],
              end: All("}"),
            },
          ],
          end: NegativeLookahead(WS, Any("<", "{")),
        },
      ],
    },

    L1: {
      name: "meta.expression.L1.flat",

      patterns: [
        {
          include: "#L0",
        },
        {
          name: "meta.expression.call.flat",
          begin: All("("),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [
            {
              include: "#expression",
            },
            {
              match: All(","),
            },
          ],
          end: All(")"),
          endCaptures: { 0: { name: "keyword.operator.flat" } },
        },
        {
          name: "meta.expression.index.flat",
          begin: All("["),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [
            {
              include: "#expression",
            },
            {
              match: All(","),
            },
          ],
          end: All("]"),
          endCaptures: { 0: { name: "keyword.operator.flat" } },
        },
        {
          name: "meta.expression.field.flat",
          begin: All("."),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ name: "variable.other.flat", match: Identifier }],
          end: NegativeLookbehind("."),
        },
      ],
    },

    L2: {
      name: "meta.expression.L2.flat",
      patterns: [
        {
          name: "meta.expression.pos.flat",
          begin: All("+"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookbehind("+"),
        },
        {
          name: "meta.expression.neg.flat",
          begin: All("-"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookbehind("-"),
        },
        {
          name: "meta.expression.lnot.flat",
          begin: All("!"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookbehind("!"),
        },
        {
          name: "meta.expression.bnot.flat",
          begin: All("~"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookahead(WS, "~"),
        },
        {
          include: "#L1",
        },
      ],
    },

    L3: {
      name: "meta.expression.L3.flat",
      patterns: [
        {
          include: "#L2",
        },
        {
          name: "meta.expression.mul.flat",
          begin: All("*"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookbehind("*"),
        },
        {
          name: "meta.expression.div.flat",
          begin: All("/"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookbehind("/"),
        },
        {
          name: "meta.expression.mod.flat",
          begin: All("%"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L2" }],
          end: NegativeLookbehind("%"),
        },
      ],
    },

    L4: {
      name: "meta.expression.L4.flat",
      patterns: [
        {
          include: "#L3",
        },
        {
          name: "meta.expression.add.flat",
          begin: All("+"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L3" }],
          end: NegativeLookbehind("+"),
        },
        {
          name: "meta.expression.sub.flat",
          begin: All("-"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L3" }],
          end: NegativeLookbehind("-"),
        },
      ],
    },

    L5: {
      name: "meta.expression.L5.flat",
      patterns: [
        {
          include: "#L4",
        },
        {
          name: "meta.expression.shl.flat",
          begin: All("<<"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L4" }],
          end: NegativeLookbehind("<<"),
        },
        {
          name: "meta.expression.shr.flat",
          begin: All(">>"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L4" }],
          end: NegativeLookbehind(">>"),
        },
      ],
    },

    L6: {
      name: "meta.expression.L6.flat",
      patterns: [
        {
          include: "#L5",
        },
        {
          name: "meta.expression.band.flat",
          begin: All("&", NegativeLookahead("&&")),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L5" }],
          end: NegativeLookbehind("&"),
        },
        {
          name: "meta.expression.bor.flat",
          begin: All("|", NegativeLookahead("||")),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L5" }],
          end: NegativeLookbehind("|"),
        },
        {
          name: "meta.expression.bxor.flat",
          begin: All("^"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L5" }],
          end: NegativeLookbehind("^"),
        },
      ],
    },

    L7: {
      name: "meta.expression.L7.flat",
      patterns: [
        {
          include: "#L6",
        },
        {
          name: "meta.expression.eq.flat",
          begin: All("=="),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L6" }],
          end: NegativeLookbehind("=="),
        },
        {
          name: "meta.expression.neq.flat",
          begin: All("!="),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L6" }],
          end: NegativeLookbehind("!="),
        },
        {
          name: "meta.expression.lt.flat",
          begin: All("<", NegativeLookahead("<<")),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L6" }],
          end: NegativeLookbehind("<"),
        },
        {
          name: "meta.expression.gt.flat",
          begin: All(">", NegativeLookahead(">>")),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L6" }],
          end: NegativeLookbehind(">"),
        },
        {
          name: "meta.expression.lteq.flat",
          begin: All("<="),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L6" }],
          end: NegativeLookbehind("<="),
        },
        {
          name: "meta.expression.gteq.flat",
          begin: All(">="),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L6" }],
          end: NegativeLookbehind(">="),
        },
      ],
    },

    L8: {
      name: "meta.expression.L8.flat",
      patterns: [
        {
          include: "#L7",
        },
        {
          name: "meta.expression.land.flat",
          begin: All("&&"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L7" }],
          end: NegativeLookbehind("&&"),
        },
      ],
    },

    L9: {
      name: "meta.expression.L9.flat",
      patterns: [
        {
          include: "#L8",
        },
        {
          name: "meta.expression.lor",
          begin: All("||"),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L8" }],
          end: NegativeLookbehind("||"),
        },
      ],
    },

    L10: {
      name: "meta.expression.L10.flat",
      patterns: [
        {
          include: "#L9",
        },
        {
          name: "meta.expression.assign.flat",
          begin: All("=", NegativeLookahead("==")),
          beginCaptures: { 0: { name: "keyword.operator.flat" } },
          patterns: [{ include: "#L10" }],
          end: NegativeLookbehind("="),
        },
      ],
    },
  },
  scopeName: "source.flat",
};

console.log(JSON.stringify(syntax, null, "  "));
