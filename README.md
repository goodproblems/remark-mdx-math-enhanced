# Remark math MDX

🚨 **IMPORTANT** this package is very new and is being developed, probably shouldn't use it in your app quite yet

## Description

Plugin to transform math nodes (like from remark-math) to JSX element nodes which render math at run time (likely using Katex)

Supports JS expressions inside of math similar to how MDX supports JS expressions inside of {...}
Allows for dynamic math expressions not possible with usage of something like rehype-katex


**Note** this plugin expects math to be rendered at run time inside of a React component instead of at compile time like rehype-katex. This means user's browsers have to do more work and should be used only when dynamic math (i.e. math with JS expressions inside) is required.

## Install

Install with npm `npm install remark-math`

# Use 

Say we have the following .mdx file

```mdx
export const pi = Math.PI

$\pi = \js{pi}$
```

And an MDX setup something like this

```js
import { readFileSync } from 'fs';

import remarkMath from 'remark-math';
import remarkMathMdx from 'remark-math-mdx';
import { compileSync } from 'xdm';

const { contents } = compileSync(readFileSync('example.mdx'), {
  jsx: true,
  remarkPlugins: [remarkMath, [remarkMathMdx, { component: 'Katex' }]],
});
console.log(contents);
```

Will result in

```mdx

export const pi = Math.PI

export default function MDXContent() {
  return <Katex>{String.raw`\pi = ${pi}`}</Katex>
}
```

## API

TODO

