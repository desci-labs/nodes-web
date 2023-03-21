export const endpoints = {
  v1: {
    auth: {
      profile: "/auth/profile",
      magic: "/auth/magic",
    },
    nodes: {
      index: "/nodes",
    },
    pub: {
      versions: "/pub/versions/",
    },
  },
} as const;
