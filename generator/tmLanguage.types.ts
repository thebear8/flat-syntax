import { Fragment } from "./builder";

export type TmLanguage = Grammar & {
  name?: string;
  scopeName: string;
  foldingStartMarker?: string;
  foldingStopMarker?: string;
  fileTypes?: string[];
  uuid?: string;
  firstLineMatch?: string;
};

export type Grammar = {
  patterns: Pattern[];
  repository?: Record<string, Pattern>;
};

export type Captures = {
  [K in number]: {
    name?: Name;
    patterns?: Pattern[];
  };
};

export type Pattern = {
  comment?: string;
  disabled?: 0 | 1;
  include?: string;
  match?: string | Fragment;
  name?: Name;
  captures?: Captures;
  patterns?: Pattern[];
} & (
  | {
      begin: string | Fragment;
      end: string | Fragment;
      contentName?: Name;
      beginCaptures?: Captures;
      endCaptures?: Captures;
      applyEndPatternsLast?: 0 | 1;
    }
  | {
      begin: string | Fragment;
      while: string | Fragment;
      contentName?: Name;
      beginCaptures?: Captures;
      whileCaptures?: Captures;
    }
  | {}
);

export type Name =
  | "comment"
  | "comment.block"
  | "comment.block.documentation"
  | "comment.line"
  | "comment.line.double-dash"
  | "comment.line.double-slash"
  | "comment.line.number-sign"
  | "comment.line.percentage"
  | "constant"
  | "constant.character"
  | "constant.character.escape"
  | "constant.language"
  | "constant.numeric"
  | "constant.other"
  | "constant.regexp"
  | "constant.rgb-value"
  | "constant.sha.git-rebase"
  | "emphasis"
  | "entity"
  | "entity.name"
  | "entity.name.class"
  | "entity.name.function"
  | "entity.name.method"
  | "entity.name.section"
  | "entity.name.selector"
  | "entity.name.tag"
  | "entity.name.type"
  | "entity.other"
  | "entity.other.attribute-name"
  | "entity.other.inherited-class"
  | "header"
  | "invalid"
  | "invalid.deprecated"
  | "invalid.illegal"
  | "keyword"
  | "keyword.control"
  | "keyword.control.less"
  | "keyword.operator"
  | "keyword.operator.new"
  | "keyword.other"
  | "keyword.other.unit"
  | "markup"
  | "markup.bold"
  | "markup.changed"
  | "markup.deleted"
  | "markup.heading"
  | "markup.inline.raw"
  | "markup.inserted"
  | "markup.italic"
  | "markup.list"
  | "markup.list.numbered"
  | "markup.list.unnumbered"
  | "markup.other"
  | "markup.punctuation.list.beginning"
  | "markup.punctuation.quote.beginning"
  | "markup.quote"
  | "markup.raw"
  | "markup.underline"
  | "markup.underline.link"
  | "meta"
  | "meta.cast"
  | "meta.parameter.type.variable"
  | "meta.preprocessor"
  | "meta.preprocessor.numeric"
  | "meta.preprocessor.string"
  | "meta.return-type"
  | "meta.selector"
  | "meta.structure.dictionary.key.python"
  | "meta.tag"
  | "meta.type.annotation"
  | "meta.type.name"
  | "metatag.php"
  | "storage"
  | "storage.modifier"
  | "storage.modifier.import.java"
  | "storage.modifier.package.java"
  | "storage.type"
  | "storage.type.cs"
  | "storage.type.java"
  | "string"
  | "string.html"
  | "string.interpolated"
  | "string.jade"
  | "string.other"
  | "string.quoted"
  | "string.quoted.double"
  | "string.quoted.other"
  | "string.quoted.single"
  | "string.quoted.triple"
  | "string.regexp"
  | "string.unquoted"
  | "string.xml"
  | "string.yaml"
  | "strong"
  | "support"
  | "support.class"
  | "support.constant"
  | "support.function"
  | "support.function.git-rebase"
  | "support.other"
  | "support.property-value"
  | "support.type"
  | "support.type.property-name"
  | "support.type.property-name.css"
  | "support.type.property-name.less"
  | "support.type.property-name.scss"
  | "support.variable"
  | "variable"
  | "variable.language"
  | "variable.name"
  | "variable.other"
  | "variable.parameter"
  | string;
