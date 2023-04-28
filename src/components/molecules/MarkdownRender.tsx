import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "react-mathjax";
import RemarkMathPlugin from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";
import CodePillButton from "@components/atoms/CodePillButton";

function MarkdownRender(props: any) {
  // const newProps = {
  //   ...props,
  //   remarkPlugins: [RemarkMathPlugin],
  //   renderers: {
  //     ...props.renderers,
  //     math: (props: any) => <MathJax.Node formula={props.value} />,
  //     inlineMath: (props: any) => <MathJax.Node inline formula={props.value} />,
  //   },
  // };

  const _mapProps = (props: any) => ({
    ...props,
    remarkPlugins: [RemarkMathPlugin],
    rehypePlugins: [rehypeKatex],
    components: {
      ...props.renderers,
      math: ({ value }: any) => `math: ${value}`,
      inlineMath: ({ value }: any) => `inlineMath: ${value}`,
      a: ({ node, inline, className, children, ...props }: any) => {
        // console.log("LINK!", node, inline, className, children, props);
        if (props.href.substring(0, 6) == "#/code") {
          return (
            <CodePillButton
              key={props.href}
              {...{ children }}
              href={props.href}
            />
          );
        }
        return <a href={props.href}>{children}</a>;
      },
    },
  });
  return (
    // <MathJax.Provider>
    <ReactMarkdown {..._mapProps(props)} />
    // </MathJax.Provider>
  );
}

export default MarkdownRender;
