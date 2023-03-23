import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@src/../../nodes/desci-models/dist";

export type cidString = string;

export function generateCidTypeMap(
  manifest: ResearchObjectV1
): Record<cidString, ResearchObjectComponentType> {
  const componentsMap: Record<cidString, ResearchObjectComponentType> = {};
  manifest.components.forEach((c) => {
    switch (c.type) {
      case ResearchObjectComponentType.CODE:
      case ResearchObjectComponentType.PDF:
        componentsMap[c.payload.url] = c.type;
        return;
      case ResearchObjectComponentType.DATA:
        componentsMap[c.payload.cid] = c.type;
        return;
      default:
        return;
    }
  });
  return componentsMap;
}
