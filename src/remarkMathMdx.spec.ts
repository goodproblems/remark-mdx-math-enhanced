import { unified } from 'unified';
import { Parser } from 'acorn';
import { u } from 'unist-builder';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import remarkMdxMathEnhancedPlugin from './remarkMathMdx';
import { removePosition } from 'unist-util-remove-position';

describe('remarkMdxMathEnhancedPlugin', () => {
  it('should compile inline katex', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx)
        .use(remarkMdxMathEnhancedPlugin)
        .use(remarkStringify)
        .processSync(String.raw`Hey this is math $\frac{a}{b}$`)
        .toString()
    ).toEqual(
      String.raw`Hey this is math <Math>{\frac{a}{b}}</Math>
`
    );
  });

  it('should compile display katex', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx)
        .use(remarkMdxMathEnhancedPlugin)
        .use(remarkStringify)
        .processSync(
          String.raw`
Hey this is math

$$
\frac{a}{b}
$$`
        )
        .toString()
    ).toEqual(
      String.raw`Hey this is math

<Math display>
  {\frac{a}{b}}
</Math>
`
    );
  });

  it('should compile inline katex with JS expressions', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx)
        .use(remarkMdxMathEnhancedPlugin)
        .use(remarkStringify)
        .processSync(
          String.raw`Hey this is math with JS $\pi = \js{Math.PI}$`
        )
        .toString()
    ).toEqual(
      `Hey this is math with JS <Math>{\\pi = $\{Math.PI\}}</Math>
`
    );
  });

  it('should compile display katex with JS expressions', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx)
        .use(remarkMdxMathEnhancedPlugin)
        .use(remarkStringify)
        .processSync(
          String.raw`Hey this is math with JS

$$
\pi = \js{Math.PI}
$$
`
        )
        .toString()
    ).toEqual(
      `Hey this is math with JS

<Math display>
  {\\pi = $\{Math.PI\}}
</Math>
`
    );
  });

  it('should parse katex with JS expressions', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMdxMathEnhancedPlugin)
        .runSync(
          removePosition(
            unified()
              .use(remarkParse)
              .use(remarkMath)
              .parse(
                String.raw`
$\pi = \js{Math.PI}$

$$
\pi = \js{Math.PI}
$$
`
              ),
            true
          )
        )
    ).toEqual(
      u('root', [
        u('paragraph', [
          u('mdxJsxTextElement', {
            name: 'Math',
            attributes: [],
            children: [
              {
                type: 'mdxTextExpression',
                value: '\\pi = ${Math.PI}',
                data: {
                  estree: Parser.parse('String.raw`\\pi = ${Math.PI}`', {
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                  }),
                },
              },
            ],
          }),
        ]),
        u('mdxJsxFlowElement', {
          name: 'Math',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'display',
            },
          ],
          children: [
            {
              type: 'mdxFlowExpression',
              value: '\\pi = ${Math.PI}',
              data: {
                estree: Parser.parse('String.raw`\\pi = ${Math.PI}`', {
                  ecmaVersion: 'latest',
                  sourceType: 'module',
                }),
              },
            },
          ],
        }),
      ])
    );
  });

  it('should not blow up with unclosed js expresions', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx)
        .use(remarkMdxMathEnhancedPlugin)
        .use(remarkStringify)
        .processSync(
          String.raw`Hey this is math with JS

$$\pi = \js{Math.PI$$
`
        )
        .toString()
    ).toEqual(
      String.raw`Hey this is math with JS

<Math>{\pi = \js{Math.PI}</Math>
`
    );
  });

  it('should allow custom component name', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx, {})
        .use(remarkMdxMathEnhancedPlugin, {
          component: 'CustomMath'
        } as any)
        .use(remarkStringify)
        .processSync(
          String.raw`Hey this is math with JS $\pi = \js{Math.PI}$`
        )
        .toString()
    ).toEqual(
      `Hey this is math with JS <CustomMath>{\\pi = $\{Math.PI\}}</CustomMath>
`
    );
  });

  it('should allow custom component name', () => {
    expect(
      unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkMdx)
        .use(remarkMdxMathEnhancedPlugin, {
          expressionPattern: /\[\[([^\{\}]+)\]\]/gm,
        } as any)
        .use(remarkStringify)
        .processSync(
          String.raw`Hey this is math with JS $\pi = [[Math.PI]]$`
        )
        .toString()
    ).toEqual(
      `Hey this is math with JS <Math>{\\pi = $\{Math.PI\}}</Math>
`
    );
  });
});
