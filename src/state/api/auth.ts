import { api } from ".";
import { setUser } from "@src/state/user/userSlice";
import { endpoints } from "./endpoint";
import { tags } from "./tags";
import { MagicLinkResponse, UserProfile } from "./types";
import { nodesApi } from "./nodes";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserProfile, void>({
      providesTags: [{ type: tags.user }],
      query: () => endpoints.v1.auth.profile,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch (error) {
          localStorage.removeItem("auth")
        }
      },
    }),
    redeemMagicLink: builder.mutation<
      MagicLinkResponse,
      { email: string; code: string }
    >({
      query: (data) => {
        return {
          url: endpoints.v1.auth.magic,
          method: "POST",
          body: data,
        };
      },
      extraOptions: {
        maxRetries: 2, // avoid user waiting too long for magic link due to default exponential backoff
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(authApi.endpoints.getUser.initiate());
          await dispatch(nodesApi.util.invalidateTags([{ type: tags.nodes }]));
        } catch (error) {}
      },
    }),
  }),
});

export const { useGetUserQuery, useRedeemMagicLinkMutation } = authApi;
