export const endpoints = {
  v1: {
    auth: {
      profile: "/auth/profile",
      magic: "/auth/magic",
    },
    nodes: {
      index: "/nodes",
    },
  },
} as const;
