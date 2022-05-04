import { readFileSync } from 'fs'

import remarkMath from 'remark-math'
import remarkMdxEnhanced from '../dist'
import { compileSync } from '@mdx-js/mdx'

const mdx = readFileSync('./examples/example.mdx').toString()

const { value } = compileSync(mdx, {
  remarkPlugins: [remarkMath, [remarkMdxEnhanced]]
})

console.log(value)