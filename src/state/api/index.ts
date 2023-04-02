import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { tags } from "./tags";

export const API_URL =
  process.env.REACT_APP_NODES_API || "http://localhost:5420/v1";

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
  baseQuery: baseQueryWithRetry,
  tagTypes: [tags.user, tags.nodes, tags.collection, tags.nodeVersions],
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
