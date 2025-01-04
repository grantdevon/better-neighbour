import { Instance, SnapshotOut, types } from "mobx-state-tree";

export const WelcomeModel = types.model("Welcome", {
    hasSeen: types.optional(types.boolean, false),
})

export interface Welcome extends Instance<typeof WelcomeModel> {}
export interface WelcomeSnapshot extends SnapshotOut<typeof WelcomeModel> {}