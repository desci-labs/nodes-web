import { api } from ".";
import { endpoints } from "./endpoint";
import { tags } from "./tags";

type NodeCoverParams = { cid: string; uuid: string; version?: string | number };

export const nodesMediaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    nodesMediaCover: builder.query<{ url: string }, NodeCoverParams>({
      providesTags: (_, error, arg) => [
        {
          type: tags.mediaCover,
          id: `${arg.uuid + arg.version ? "/" + arg.version : ""}`,
        },
      ],
      query: ({ cid, uuid, version }: NodeCoverParams) =>
        `${endpoints.v1.nodes.media.cover}${uuid}${`/${version}`}?cid=${cid}`,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          console.log("nodesMediaCover", args);
          await queryFulfilled;
        } catch (error) {}
      },
    }),
  }),
});

export const { useNodesMediaCoverQuery } = nodesMediaApi;
