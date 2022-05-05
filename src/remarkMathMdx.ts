/** @typedef {import('remark-math')} */

import { visit } from 'unist-util-visit';
import { Parser } from 'acorn';
import type { Root } from 'mdast';
import type { Program } from 'estree-jsx';

const DEFAULT_OPTIONS = {
  component: 'Math',
  startDelimiter: '\\js{',
  endDelimiter: '}',
};

export type Options = {
  component?: string
  startDelimiter?: string
  endDelimiter?: string
};

/**
 * Plugin to transform math nodes to JSX element nodes which render math at run time
 *
 * @param options
 * @param options.component - Name of react component to transform remark math nodes to (which will render math)
 * @param options.startDelimiter - Start delimiter of JS expressions, default is `\js{`
 * @param options.endDelimiter - End delimiter of JS expressions, default is `}`
 */
export default function remarkMdxMathEnhancedPlugin(options?: Options) {
  const { component, startDelimiter, endDelimiter } = { ...DEFAULT_OPTIONS, ...options };

  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (node.type === 'math') {
        const transformedMath = transformToTemplateString(
          node.value,
          startDelimiter,
          endDelimiter
        );
        const estree = transformMathToEstree(transformedMath);

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
                estree,
              },
            },
          ],
        });
      }

      if (node.type === 'inlineMath') {
        const transformedMath = transformToTemplateString(
          node.value,
          startDelimiter,
          endDelimiter
        );
        const estree = transformMathToEstree(transformedMath);

        parent.children.splice(index, 1, {
          type: 'mdxJsxTextElement',
          name: component,
          attributes: [],
          children: [
            {
              type: 'mdxTextExpression',
              value: transformedMath,
              data: {
                estree,
              },
            },
          ],
        });
      }
    });
  };


  /**
   * Parse the the contents of a Math node into ESTree
   */
  function transformMathToEstree(string: string) {
    return Parser.parse(`String.raw\`${string}\``, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    }) as unknown as Program; // acorn types are messed...
  }
}

/**
 * Parses string for JS expressions delimited by startDelimiter and endDelimiter
 * and wraps them in `${...}` to return a valid template string
 */
function transformToTemplateString(
  string: string,
  startDelimiter: string,
  endDelimiter: string
) {
  return tokenize(string).join('');

  function readToken(input, i) {
    const patterns = [
      ['startDelimiter', new RegExp(`^${escapeDelimiter(startDelimiter)}`)],
      ['endDelimiter', new RegExp(`^${escapeDelimiter(endDelimiter)}`)],
      ['other', /^[\s\S]/],
    ];

    for (let j = 0; j < patterns.length; j++) {
      let regex = patterns[j][1];
      let result = input.slice(i).match(regex);

      if (result !== null) {
        let text = result[0];
        let token = [patterns[j][0], text];
        return [token, i + text.length];
      }
    }

    throw new Error(`No pattern matched ${input.slice(i)}`);
  }

  function tokenize(string) {
    let tokens = [];
    let state: 'math' | 'js' = 'math';

    for (let i = 0; i < string.length; ) {
      let result = readToken(string, i);
      let token = result[0];

      if (token[0] === 'startDelimiter') {
        if (state === 'math') {
          state = 'js';
          tokens = [...tokens, '${'];
        } else {
          tokens = [...tokens, token[1]];
        }
      } else if (token[0] === 'endDelimiter') {
        state = 'math';
        tokens = [...tokens, '}'];
      } else {
        tokens = [...tokens, token[1]];
      }

      i = result[1];
    }

    return tokens;
  }

  // Escape special characters from delimiter for use in regex
  function escapeDelimiter(delimiter: string) {
    return delimiter.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }
}
