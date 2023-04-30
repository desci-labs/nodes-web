import { api } from ".";
import { setPublishedNodes } from "../nodes/history";
import { endpoints } from "./endpoint";
import { tags } from "./tags";
import { VersionResponse } from "./types";

export const publishApi = api.injectEndpoints({
  endpoints: (builder) => ({
    researchObjectVersions: builder.query<VersionResponse, string>({
      providesTags: (_, error, arg) => [{ type: tags.nodeVersions, id: arg }],
      query: (arg: string) => `${endpoints.v1.pub.versions}${arg}`,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // console.log("IndexedNode", args, data);
          dispatch(setPublishedNodes({ [args]: data }));
        } catch (error) {}
      },
    }),
  }),
});

export const { useResearchObjectVersionsQuery } = publishApi;
