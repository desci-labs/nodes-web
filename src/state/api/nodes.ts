import { api } from ".";
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
      // async onQueryStarted(args, { dispatch, queryFulfilled }) {
      //   console.log("onQueryStarted", args);
      //   try {
      //     const { data } = await queryFulfilled;
      //     console.log("Set Nodes", data);
      //   } catch (error) {}
      // },
    }),
  }),
});

export const { useGetNodesQuery } = nodesApi;
