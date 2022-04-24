import { visit, Node, CONTINUE } from 'unist-util-visit';
import { Parser } from 'acorn';
import type { Root, Literal, Parent } from 'mdast';
import type { Program } from 'estree-jsx';

/**
 * Plugin to transform math nodes (like from remark-math) to JSX element nodes which render math at run time (likely using Katex)
 *
 * Supports JS expressions inside of math similar to how MDX supports JS expressions inside of {...}
 * Allows for dynamic math expressions not possible with usage of something like rehype-katex
 *
 * e.g.
 *
 * export const pi = Math.PI
 *
 * $\pi = \js{pi}$
 *
 * is transformed to
 *
 * <Katex>{String.raw`\pi = ${pi}`}</Katex>
 *
 * **Note** this plugin expects math to be rendered at run time inside of a React compoent instead of
 * at compile time like rehype-katex. This means user's browsers have to do more work and should be used
 * only when dynamic math (i.e. math with JS expressions inside) is required.
 *
 * @param {Object} options
 * @param {string} options.component - Name of react component to transform remark math nodes to (which will render math)
 * @param {RegExp} options.expressionPattern - Regex to match JS expressions inside of math to convert to `${...}`. Default is to match `\js{...}`
 */
export default function remarkMathMdxPlugin(
  options = {
    component: 'Katex',
    expressionPattern: /\\js\{([^\{\}]+)\}/gm,
  }
) {
  return (tree: Root) => {
    visit<Root>(tree, (node, index, parent: Parent) => {
      if (isMathNode(node)) {
        const transformedMath = transformJSExpressions(node.value);
        const estree = transformMathToEstree(transformedMath)

        parent.children.splice(index, 1, {
          type: 'mdxJsxFlowElement',
          name: options.component,
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

      if (isInlineMathNode(node)) {
        const transformedMath = transformJSExpressions(node.value);
        const estree = transformMathToEstree(transformedMath)

        parent.children.splice(index, 1, {
          type: 'mdxJsxTextElement',
          name: options.component,
          attributes: [],
          children: [{
            type: 'mdxTextExpression',
            value: transformedMath,
            data: {
              estree
            }
          }],
        });
        return [CONTINUE, index];
      }
    });
  };

  /**
   * Replaces any instances of `\js{...}` in a string with `${...}` in order to
   * evaluate the contents of the macro as javascript
   */
  function transformJSExpressions(string: string) {
    return string.replace(options.expressionPattern, '${$1}').trim();
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

  function isMathNode(node: Node): node is Literal {
    return node.type === 'math';
  }

  function isInlineMathNode(node: Node): node is Literal {
    return node.type === 'inlineMath';
  }
}
