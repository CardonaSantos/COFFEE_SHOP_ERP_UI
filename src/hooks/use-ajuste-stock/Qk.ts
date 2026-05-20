export const stockQkeys = {
  all: ["stock"] as const,

  toEdit: (id: number) => [...stockQkeys.all, "to-edit", id] as const,

  lists: () => [...stockQkeys.all, "list"] as const,
};
