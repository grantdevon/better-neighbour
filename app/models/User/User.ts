import { Instance, SnapshotOut, types } from "mobx-state-tree";

export const UserModel = types.model("User", {
    id: types.optional(types.identifier, ""),
    firstName: types.optional(types.string, ""),
    lastName: types.optional(types.string, ""),
    email: types.optional(types.string, ""),
    trustPoints: types.optional(types.number, 0),
    verified: types.optional(types.boolean, false),
    dateJoined: types.optional(types.string, '')
  })

/**
 * The User instance.
 */
export interface User extends Instance<typeof UserModel> {}
/**
 * The data of a User.
 */
export interface UserSnapshot extends SnapshotOut<typeof UserModel> {}