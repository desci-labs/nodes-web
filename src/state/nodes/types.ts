import { ResearchObjectV1History } from "@src/../../nodes/desci-models/dist";

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

export type HistoryMap = Record<string, ResearchObjectV1History[]>;

export interface HistoryEntryProps {
  index: number;
  pending: boolean;
  data: ResearchObjectV1History;
  selected: boolean;
}
