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
    privateShare: builder.query<string, string>({
      providesTags: (_, error, arg) => [{ type: tags.privateShare, id: arg }],
      query: (uuid: string) => `${endpoints.v1.nodes.share.index}/${uuid}`,
      transformResponse: (response: { shareId: string }) => response.shareId,
    }),
    createShareLink: builder.mutation<{ shareId: string; ok: boolean }, string>(
      {
        query: (shareId: string) => {
          return {
            url: `${endpoints.v1.nodes.share.index}/${shareId}`,
            method: "POST",
          };
        },
        async onQueryStarted(args: string, { dispatch, queryFulfilled }) {
          try {
            const {
              data: { shareId },
            } = await queryFulfilled;
            dispatch(
              nodesApi.util.updateQueryData("privateShare", args, () => shareId)
            );
            dispatch(
              nodesApi.util.invalidateTags([
                { type: tags.privateShare, id: args },
              ])
            );
          } catch (error) {}
        },
      }
    ),
    
    revokeShareLink: builder.mutation<{ shareId: string; ok: boolean }, string>(
      {
        query: (shareId: string) => {
          return {
            url: `${endpoints.v1.nodes.share.revoke}/${shareId}`,
            method: "POST",
          };
        },
        async onQueryStarted(args: string, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              nodesApi.util.updateQueryData("privateShare", args, () => "")
            );
            dispatch(
              nodesApi.util.invalidateTags([
                { type: tags.privateShare, id: args },
              ])
            );
          } catch (error) {}
        },
      }
    ),
  }),
});

export const {
  useGetNodesQuery,
  usePrivateShareQuery,
  useRevokeShareLinkMutation,
  useCreateShareLinkMutation,
} = nodesApi;
