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
 * Supports JS expressions inside of math similar to how MDX supports JS expressions inside of {...}
 * Allows for dynamic math expressions not possible with usage of existing solutions like rehype-katex
 *
 * e.g.
 *
 * export const pi = Math.PI
 *
 * $\js{props.n}\pi = \js{props.n * pi}$
 *
 * is transformed to
 *
 * <Math>{String.raw`${props.n}\pi = ${props.n * pi}`}</Math>
 *
 * **Note** this plugin expects math to be rendered at run time inside of a React compoent instead of
 * at compile time like rehype-katex. This means user's browsers have to do more work and should be used
 * only when dynamic math (i.e. math with JS expressions inside) is required.
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
