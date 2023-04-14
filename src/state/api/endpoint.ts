export const endpoints = {
  v1: {
    auth: {
      profile: "/auth/profile",
      magic: "/auth/magic",
    },
    nodes: {
      index: "/nodes",
      share: {
        index: "/nodes/share",
        revoke: "/nodes/revokeShare",
      },
      media: {
        cover: "nodes/cover/",
      },
    },
    pub: {
      versions: "/pub/versions/",
    },
  },
} as const;
