import { Instance, SnapshotOut, types } from "mobx-state-tree";

const CoordsModel = types.model("CoordsModel", {
    lat: types.number,
    lng: types.number
})

export const ReportsModel = types.model("ReportsModel", {
    coords: CoordsModel,
    date: types.optional(types.string, ''),
    time: types.optional(types.string, ''),
    description: types.optional(types.string, ''),
    location: types.optional(types.string, ''),
    name: types.optional(types.string, ''),
    reportType: types.optional(types.string, '')
})

/**
 * The User instance.
 */
export interface Report extends Instance<typeof ReportsModel> {}
/**
 * The data of a User.
 */
export interface ReportSnapshot extends SnapshotOut<typeof ReportsModel> {}