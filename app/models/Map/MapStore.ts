import { flow, Instance, types } from "mobx-state-tree"

const MAPSTATE = types.enumeration("MAPSTATE", ["Pin", "HeatMap"])

const Pin = types.model("Pin", {
  lat: types.number,
  lng: types.number,
})

export const MapStoreModel = types
  .model("MapStoreModel")
  .props({
    mapState: "HeatMap",
    pin: types.optional(Pin, { lat: 0, lng: 0 }),
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

    const setPin = flow(function* (newPin: Instance<typeof Pin>) {
      try {
        self.pin = Pin.create(newPin)
      } catch (error) {
        console.error("Failed to set pin:", error)
        self.pin = { lat: 0, lng: 0 }
      }
    })

    const fetchPin = flow(function* () {
      try {
        return self.pin
      } catch (error) {
        console.error("Failed to fetch pin:", error)
        return []
      }
    })
    return { setMapState, setPin, fetchPin }
  })
