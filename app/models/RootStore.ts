import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { UserStoreModel } from "./User/UserStore"
import { ReportStoreModel } from "./Report/ReportStore"
import { MapStoreModel } from "./Map/MapStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
    userStore: types.optional(UserStoreModel, {}),
    reportStore: types.optional(ReportStoreModel, {}),
    mapStore: types.optional(MapStoreModel, {})
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
