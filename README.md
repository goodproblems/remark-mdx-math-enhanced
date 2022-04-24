# Remark math MDX

🚨 **IMPORTANT** this package is very new and is being developed, probably shouldn't use it in your app quite yet


Plugin to transform math nodes (like from remark-math) to JSX element nodes which render math at run time (likely using Katex)

Supports JS expressions inside of math similar to how MDX supports JS expressions inside of {...}
Allows for dynamic math expressions not possible with usage of something like rehype-katex

e.g.

```mdx
export const pi = Math.PI

$\pi = \js{pi}$
```

is transformed to

```mdx
<Katex>{String.raw`\pi = ${pi}`}</Katex>
```

**Note** this plugin expects math to be rendered at run time inside of a React component instead of at compile time like rehype-katex. This means user's browsers have to do more work and should be used only when dynamic math (i.e. math with JS expressions inside) is required.
