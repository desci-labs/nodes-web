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
        `${endpoints.v1.nodes.media.cover}${uuid}${
          version ? `/${version}` : ""
        }?cid=${cid}`,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          console.log("nodesMediaCover", args);
          await queryFulfilled;
        } catch (error) {}
      },
    }),
    setNodeCover: builder.mutation<
      { url: string; ok: boolean },
      NodeCoverParams
    >({
      query: ({ cid, uuid, version }: NodeCoverParams) => {
        return {
          url: `${endpoints.v1.nodes.media.cover}${uuid}${
          version ? `/${version}` : ""
        }?cid=${cid}`,
          method: "POST",
        };
      },
      async onQueryStarted(
        args: NodeCoverParams,
        { dispatch, queryFulfilled }
      ) {
        try {
          const {
            data: { url },
          } = await queryFulfilled;
          console.log("cover set", url);
        } catch (error) {
          console.log("Error setting node cover", args, error);
        }
      },
    }),
  }),
});

export const { useNodesMediaCoverQuery, useSetNodeCoverMutation } = nodesMediaApi;
