# Remark MDX math enhanced

> An MDX plugin enhancing math environments by adding support for embedded JS expressions (including full access to props, exports, etc), analogous to how MDX supports JS expressions inside of `{...}`

The main difference with this plugin and [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex) is that instead of rendering math nodes at compile time, it instead transforms math nodes into JSX elements which will render their math (passed as `children` prop) at runtime. Any JS expressions embedded in katex will be parsed by [acorn](https://github.com/acornjs/acorn) and transformed to MDX expression nodes.

**🚨 Important Note:** This plugin is quite new and currently still in alpha, it's possible the API / approach may change a bit so use at your own risk. Feedback is also appreciated!

**Note:** This plugin expects you to define your own `Math` component which will handle rendering. For an example implementation of a `<Math/>` component using [Katex](http://katex.org) see [examples/Math.js](https://github.com/goodproblems/remark-mdx-math-enhanced/tree/master/examples/Math.js)

**Note:** Rendering math at runtime instead of compile time means browsers have to do more owrk. Accordingly, this plugin should only be used in cases where dynamic math (i.e. math with JS expressions inside) is actually required

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

Note how `\js{...}` have been replaced by `${...}` which are valid [string interpolation placeholders](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#string_interpolation). This replacement is done via regex, and is configureable.


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