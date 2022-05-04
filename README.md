# Remark MDX math enhanced

> An MDX plugin allowing for dynamic math content by transforming math nodes generated by [remark-math](https://github.com/remarkjs/remark-math) into JSX element nodes which render math at run time 

The main advantage of this plugin over [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex) is that it supports JS expressions embedded inside of of math environments, similar to how MDX supports JS expressions inside of `{...}`. This allows for dynamic math expressions which depend on props, and other fun stuff.

**Note** this plugin expects math to be rendered at run time inside of a React component, instead of at compile time like rehype-katex. This means user's browsers have to do more work and should be used only in cases where dynamic math (i.e. math with JS expressions inside) is required.

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

Note how `\js{...}` have been replaced by `${...}` which are valid [string interpolation placeholders](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#string_interpolation)


For an example implementation of a `<Math/>` using [Katex](http://katex.org) component see [examples/Math.js](https://github.com/goodproblems/remark-mdx-math-enhanced/tree/master/examples/Math.js)


## API

The default export is `remarkMdxMathEnhanced`.

### `unified().use(remarkMdx).use(remarkMath).use(remarkMdxMathEnhanced[, options])`

Plugin to transform math nodes to JSX element nodes which render math at run time

##### `options`

Configuration (optional).

###### `options.component`

Name of react component which will be used to render math

###### `options.expressionPattern`

Regular expression that matches JS expressions embedded in math. Default regex matches `\js{...}`