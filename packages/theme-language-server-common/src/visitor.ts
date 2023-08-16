import { AST, NodeOfType, NodeTypes, SourceCodeType } from '@shopify/theme-check-common';

export type VisitorMethod<S extends SourceCodeType, T, R> = (
  node: NodeOfType<S, T>,
  ancestors: AST[S][],
) => R | undefined;

export type Visitor<S extends SourceCodeType, R> = {
  /** Happens once per node, while going down the tree */
  [T in NodeTypes[S]]?: VisitorMethod<S, T, R>;
};

function isNode<S extends SourceCodeType>(x: any): x is NodeOfType<S, NodeTypes[S]> {
  return x !== null && typeof x === 'object' && typeof x.type === 'string';
}

export type ExecuteFunction<S extends SourceCodeType> = (node: AST[S], lineage: AST[S][]) => void;

/**
 * @example
 *
 * const links = visit<'LiquidHTML', DocumentLink>(liquidAST, {
 *   'LiquidTag': (node, ancestors) => {
 *     if (node.name === 'render' || node.name === 'include') {
 *       return DocumentLink.create(...);
 *     }
 *   },
 * })
 *
 * Note: this is the ChatGPT-rewritten version of the recursive method.
 * If you want to refactor it, just ask it to do it for you :P
 */
export function visit<S extends SourceCodeType, R>(node: AST[S], visitor: Visitor<S, R>): R[] {
  const results: R[] = [];
  const stack: { node: AST[S]; lineage: AST[S][] }[] = [{ node, lineage: [] }];
  const pushStack = (node: AST[S], lineage: AST[S][]) => stack.push({ node, lineage });

  while (stack.length > 0) {
    // Visit current node
    const { node, lineage } = stack.pop() as {
      node: AST[S];
      lineage: AST[S][];
    };

    const visitNode = visitor[node.type as any as NodeTypes[S]];
    const result = visitNode ? visitNode(node as NodeOfType<S, NodeTypes[S]>, lineage) : undefined;
    if (result !== undefined) results.push(result);

    // Enqueue child nodes
    const newLineage = lineage.concat(node);
    forEachChildNodes(node, newLineage, pushStack);
  }

  return results;
}

export function forEachChildNodes<S extends SourceCodeType>(
  node: AST[S],
  lineage: AST[S][],
  execute: ExecuteFunction<S>,
) {
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value.filter(isNode<S>).reverse()) {
        execute(child, lineage);
      }
    } else if (isNode<S>(value)) {
      execute(value, lineage);
    }
  }
}
