import * as AST from '../parsers/ast';
import { LiquidParserOptions } from './utils';
import {
  augmentWithCSSDisplay,
  augmentWithSiblings,
  augmentWithWhitespaceHelpers,
  DocumentNode,
} from './preprocess';

// This is super hard to type check so I'll just magically assume
// everything works.
export function preprocess(
  ast: AST.DocumentNode,
  options: LiquidParserOptions,
): DocumentNode {
  const augmentationPipeline = [
    augmentWithSiblings,
    augmentWithCSSDisplay,
    augmentWithWhitespaceHelpers,
  ].map((fn) => fn.bind(null, options));

  for (const augmentation of augmentationPipeline) {
    AST.walk(ast, augmentation as any);
  }
  return ast as DocumentNode;
}
