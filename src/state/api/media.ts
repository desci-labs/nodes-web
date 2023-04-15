import { api } from ".";
import { endpoints } from "./endpoint";
import { tags } from "./tags";

export const nodesMediaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    nodesMediaCover: builder.query<
      { url: string },
      { cid: string; nodeUuid: string }
    >({
      providesTags: (_, error, arg) => [{ type: tags.mediaCover, id: arg.cid }],
      query: ({ cid, nodeUuid }: { cid: string; nodeUuid: string }) =>
        `${endpoints.v1.nodes.media.cover}${cid}?nodeUuid=${nodeUuid}`,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // console.log("IndexedNode", args, data);
        } catch (error) {}
      },
    }),
  }),
});

export const { useNodesMediaCoverQuery } = nodesMediaApi;
