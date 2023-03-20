import { api } from ".";
import { setPublishedNodes } from "../nodes/history";
import { PublishedMap } from "../nodes/types";
import { endpoints } from "./endpoint";
import { tags } from "./tags";
import { ResearchNode } from "./types";

export const nodesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNodes: builder.query<ResearchNode[], void>({
      providesTags: [{ type: tags.nodes }],
      query: () => endpoints.v1.nodes.index,
      transformResponse: (response: { nodes: ResearchNode[] }) => {
        return response.nodes;
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const publishedNodes = data
            .filter((n: any) => n.isPublished)
            .map((n: any) => ({ uuid: n.uuid, index: n.index }));
          if (publishedNodes.length) {
            const map: PublishedMap = {};
            publishedNodes.forEach((n: any) => {
              map[n.uuid] = n.index;
            });
            dispatch(setPublishedNodes(map));
          }
        } catch (error) {}
      },
    }),
  }),
});

export const { useGetNodesQuery } = nodesApi;
