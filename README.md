# Remark MDX math enhanced

> An MDX plugin that adds support for math environments with embedded JS expressions

---

**🚨 Important Note:** This plugin is quite new and currently still in beta, it's possible the API and/or approach may change so **use at your own risk**.

---

The standard approach to rendering math in MDX is to use remark-math to parse math nodes, and then rehype-katex to compile math nodes to HTML at compile time. This works great in most cases, however it does have the downside that your math must be entirely static (i.e. not containing any JS expressions). 

That's where this plug-in comes into play. Instead of rendering math nodes to HTML at compile time, they are instead transformed into JSX elements. Any JS expressions embedded in katex will be parsed by [acorn](https://github.com/acornjs/acorn) and transformed to MDX expression nodes.

## Notes

1. This plugin expects you to define your own `Math` component which will handle rendering. For an example implementation of a `<Math/>` component using [Katex](http://katex.org) see [examples/Math.js](https://github.com/goodproblems/remark-mdx-math-enhanced/tree/master/examples/Math.js)

2. Rendering math at runtime instead of compile time means browsers have to do more work. Accordingly, this plugin should only be used in cases where dynamic math (i.e. math with JS expressions inside) is actually required

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
