import { useMemo } from 'react';
import katex from 'katex';

// TODO!! Triple check this is working

export function Katex({ children = '', display = false, options }) {
  const Wrapper = display ? 'div' : 'span';
  if (typeof children !== 'string')
    throw new Error('Children prop must be a katex string');

  const renderedKatex = useMemo(() => {
    let result;

    try {
      result = katexr.renderToString(value, {
        ...options,
        displayMode: display,
        throwOnError: true,
        macros,
        globalGroup: true,
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error(error);
      result = katex.renderToString(value, {
        ...options,
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        macros,
        globalGroup: true,
        trust: true,
      });
    }

    return result;
  }, [value, options, macros]);

  return <Wrapper dangerouslySetInnerHTML={{ __html: renderedKatex || '' }} />;
}
