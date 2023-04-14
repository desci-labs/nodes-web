import { media_api } from ".";
import { endpoints } from "./endpoint";
import { tags } from "./tags";

export const nodesMediaApi = media_api.injectEndpoints({
  endpoints: (builder) => ({
    nodesMediaCover: builder.query<{ url: string }, string>({
      providesTags: (_, error, arg) => [{ type: tags.mediaCover, id: arg }],
      query: (cid: string) => `${endpoints.v1.nodes.media.cover}${cid}`,
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
