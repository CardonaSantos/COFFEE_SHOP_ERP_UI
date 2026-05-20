import { QueryDashboard } from "./use-dashboard";

export const dashboardAnalitycsQkeys = {
  all: ["dashboard"] as const,
  query: (query: QueryDashboard) =>
    [...dashboardAnalitycsQkeys.all, query] as const,
};
