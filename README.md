# Remark MDX math enhanced

> An MDX plugin adding support for math environments with embedded JS expressions

## What is this?

This package allows math environments in MDX documents to contain embedded JavaScript expressions analogous to [MDX expressions](https://mdxjs.com/docs/what-is-mdx/#expressions). These expressions have full access to props, exports, etc.

## How it works

Math nodes produced by [remark-math](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math) are transformed into JSX element nodes at compile time and rendered at run time via a React component which your app is expected to provide (default is `Math` but is configurable)

---

**🚨 Important:** This plugin is quite new and currently still in beta, it's possible the API and/or approach may change so **use at your own risk**.

---


## Notes

- This plugin expects you to define your own `Math` component which will handle rendering. For an example implementation of a `<Math/>` component using [Katex](http://katex.org) see [examples/Math.js](https://github.com/goodproblems/remark-mdx-math-enhanced/tree/master/examples/Math.js)

- Rendering math at runtime instead of compile time means that client-side JS is required, and browsers have to do a fair bit more work. Accordingly, this plugin should only be used in cases where dynamic math (i.e. math with JS expressions inside) is actually required

## Install

Install with npm `npm install remark-mdx-math-enhanced`

## Use 

Say we have the following .mdx file where we want to render some math with a generated value of pi times a prop value

```mdx
export const pi = Math.PI

$\js{props.N}\pi = \js{props.N * pi}$

$$
\js{props.N}\pi = \js{props.N * pi}
$$
```

And an MDX setup something like this

```js
import { readFileSync } from 'fs'

import remarkMath from 'remark-math'
import remarkMdxEnhanced from 'remark-mdx-math-enhanced'
import { compileSync } from '@mdx-js/mdx'

const { value } = compileSync(readFileSync('example.mdx'), {
  remarkPlugins: [remarkMath, [remarkMdxEnhanced, { component: 'Math' }]]
})

console.log(value)
```

Will result in something like

```jsx
export const pi = Math.PI

export default function MDXContent(props) {
  return <>
    <Math>{String.raw`${props.N}\pi = ${props.N * pi}`}</Math>
    <Math display>{String.raw`${props.N}\pi = ${props.N * pi}`}</Math>
  </>
}
```

Note how `\js{...}` have been replaced by `${...}` which are valid [string interpolation placeholders](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#string_interpolation).


## API

The default export is `remarkMdxMathEnhanced`.

### `unified().use(remarkMdx).use(remarkMath).use(remarkMdxMathEnhanced[, options])`

Plugin to transform math nodes to JSX element nodes which render math at run time

##### `options`

Configuration (optional).

###### `options.component`

Name of react component which will be used to render math, default is 'Math'

###### `options.startDelimiter`

Start delimiter of JS expressions, default is `\js{`

###### `options.endDelimiter`

Start delimiter of JS expressions, default is `}`
