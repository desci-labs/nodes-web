export interface IndexedNodeVersion {
  cid?: string;
  id?: string;
  time?: string;
}
export interface IndexedNode {
  id?: string;
  id10?: string;
  owner?: string;
  recentCid?: string;
  versions: IndexedNodeVersion[];
}

export type PublishedMap = { [uuid: string]: IndexedNode };
