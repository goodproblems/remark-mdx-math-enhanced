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
      String.raw`Hey this is math <Katex>{\frac{a}{b}}</Katex>
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

<Katex display>
  {\frac{a}{b}}
</Katex>
`
    );
  });

  describe('JS expressions', () => {
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
        `Hey this is math with JS <Katex>{\\pi = $\{Math.PI\}}</Katex>
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

<Katex display>
  {\\pi = $\{Math.PI\}}
</Katex>
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
              name: 'Katex',
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
            name: 'Katex',
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

<Katex>{\pi = \js{Math.PI}</Katex>
`
      );
    });
  });
});
