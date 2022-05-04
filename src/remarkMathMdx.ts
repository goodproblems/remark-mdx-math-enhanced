/** @typedef {import('remark-math')} */

import { visit, CONTINUE } from 'unist-util-visit';
import { Parser } from 'acorn';
import type { Root } from 'mdast';
import type { Program } from 'estree-jsx';

const DEFAULT_OPTIONS = {
  component: 'Math',
  expressionPattern: /\\js\{([^\{\}]+)\}/gm,
}

export type Options = {
  component: string,
  expressionPattern: RegExp
}

/**
 * Plugin to transform math nodes to JSX element nodes which render math at run time
 *
 * @param options
 * @param options.component - Name of react component to transform remark math nodes to (which will render math)
 * @param options.expressionPattern - Regex to match JS expressions inside of math to convert to `${...}`. Default is to match `\js{...}`
 */
export default function remarkMdxMathEnhancedPlugin(
  options?: Options
) {
  const { component, expressionPattern } = { ...DEFAULT_OPTIONS, ...options }

  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'math') {
        const transformedMath = transformJSExpressions(node.value);
        const estree = transformMathToEstree(transformedMath)

        parent.children.splice(index, 1, {
          type: 'mdxJsxFlowElement',
          name: component,
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'display',
            },
          ],
          children: [
            {
              type: 'mdxFlowExpression',
              value: transformedMath,
              data: {
                estree
              },
            },
          ],
        });

        return [CONTINUE, index];
      }

      if (node.type === 'inlineMath') {
        const transformedMath = transformJSExpressions(node.value);
        const estree = transformMathToEstree(transformedMath)

        parent.children.splice(index, 1, {
          type: 'mdxJsxTextElement',
          name: component,
          attributes: [],
          children: [{
            type: 'mdxTextExpression',
            value: transformedMath,
            data: {
              estree
            }
          }],
        });
      }
    });
  };

  /**
   * Replaces any instances of `\js{...}` in a string with `${...}` in order to
   * evaluate the contents of the macro as javascript
   */
  function transformJSExpressions(string: string) {
    return string.replace(expressionPattern, '${$1}').trim();
  }

  /**
   * Parse the the contents of a Math node into ESTree
   */
  function transformMathToEstree(string: string) {
    return Parser.parse(`String.raw\`${string}\``, {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }) as unknown as Program // acorn types are messed...
  }
}
