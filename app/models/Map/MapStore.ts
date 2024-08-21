import { flow, Instance, types } from "mobx-state-tree"

const MAPSTATE = types.enumeration("MAPSTATE", ["Pin", "HeatMap"])

export const MapStoreModel = types
  .model("MapStoreModel")
  .props({
    mapState: 'HeatMap',
    state: "",
  })
  .actions((self) => {
    const setMapState = flow(function* (state: Instance<typeof MAPSTATE>) {
      try {
        self.mapState = state
      } catch (error) {
        self.mapState = "HeatMap"
      }
    })

    return { setMapState }
  })
