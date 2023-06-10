import {
  FetchArgs,
  createApi,
  fetchBaseQuery,
  retry,
} from "@reduxjs/toolkit/query/react";
import { tags } from "./tags";

export const API_URL =
  process.env.REACT_APP_NODES_API || "http://localhost:5420/v1";

export const NODES_MEDIA_API_URL =
  process.env.REACT_APP_NODES_MEDIA_API || "http://localhost:5420/v1";

export interface CustomError {
  data: {
    ok: false;
    message: string;
  };
  status: number;
}

const staggeredBaseQueryWithBailOut = retry(
  async (args: string | FetchArgs, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: `${API_URL}/v1`,
      mode: "cors",
      prepareHeaders(headers, { getState, endpoint }) {
        headers.set("Authorization", `Bearer ${localStorage.getItem("auth")}`);
      },
    })(args, api, extraOptions);

    // bail out of re-tries immediately if unauthorized,
    // because we know successive re-retries would be redundant
    if ([401, 403, "CUSTOM_ERROR"].includes(result.error?.status ?? "")) {
      retry.fail(result.error);
    }

    return result;
  },
  {
    maxRetries: 5,
  }
);

const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: `${API_URL}/v1`,
    mode: "cors",
    prepareHeaders(headers, { getState, endpoint }) {
      headers.set("Authorization", `Bearer ${localStorage.getItem("auth")}`);
    },
  }),
  /* current default for all apis */
  {
    maxRetries: 5,
  }
);

export const api = createApi({
  reducerPath: "api",
  baseQuery: staggeredBaseQueryWithBailOut,
  tagTypes: [
    tags.user,
    tags.nodes,
    tags.mediaCover,
    tags.collection,
    tags.nodeVersions,
    tags.privateShare,
  ],
  endpoints: () => ({}),
});

export const media_api = createApi({
  reducerPath: "nodes-media-api",
  baseQuery: retry(
    fetchBaseQuery({
      baseUrl: `${NODES_MEDIA_API_URL}/v1`,
      mode: "cors",
    }),
    { maxRetries: 2 }
  ),
  tagTypes: [tags.mediaCover],
  endpoints: () => ({}),
});

export const config = () => {
  return {
    withCredentials: true,
    headers: {
      authorization: `Bearer ${localStorage.getItem("auth")}`,
    },
  };
};
