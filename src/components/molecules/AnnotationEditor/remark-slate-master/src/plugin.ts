import { MdastNode, OptionType } from './ast-types';
import transform from './deserialize';

export default function plugin(opts?: OptionType) {
  const compiler = (node: { children: Array<MdastNode> }) => {
    if(node.children.length) {
      return node.children.map((c) => transform(c, opts));
    } else {
      return [{ type: 'paragraph', children: [{ text: '' }]}]
    }
  };

  // @ts-ignore
  this.Compiler = compiler;
}
