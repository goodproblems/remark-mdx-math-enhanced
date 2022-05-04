/** @typedef {import('remark-math')} */

import { visit } from 'unist-util-visit';
import { Parser } from 'acorn';
import type { Root } from 'mdast';
import type { Program } from 'estree-jsx';

const DEFAULT_OPTIONS = {
  component: 'Math',
  expressionMarker: "\\js"
}

export type Options = {
  component?: string,
  expressionMarker?: string
}

/**
 * Plugin to transform math nodes to JSX element nodes which render math at run time
 *
 * @param options
 * @param options.component - Name of react component to transform remark math nodes to (which will render math)
 * @param options.expressionMarker - Start delimiter of JS expressions, default is `\js`
 */
export default function remarkMdxMathEnhancedPlugin(
  options?: Options
) {
  const { component, expressionMarker } = { ...DEFAULT_OPTIONS, ...options }

  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'math') {
        const transformedMath = transformToTemplateString(node.value, expressionMarker);
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
      }

      if (node.type === 'inlineMath') {
        const transformedMath = transformToTemplateString(node.value, expressionMarker);
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
   * Replaces any instances of expressionMarker in string that are followed by a curly
   * braces with $ in order to create a valid template string literal
   */
  function transformToTemplateString(string: string, expressionMarker: string) {
    return string.replace(new RegExp(`(${expressionMarker.replace(/\\/, '\\\\')})(?=\{)`, 'g'), '$')
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
