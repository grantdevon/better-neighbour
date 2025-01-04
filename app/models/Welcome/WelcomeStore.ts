import { flow, types } from "mobx-state-tree"
import { WelcomeModel } from "./Welcome"

export const WelcomeStoreModel = types
  .model("WelcomeStore")
  .props({
    welcome: types.optional(WelcomeModel, {}),
  })
  .actions((self) => {
    const setHasSeen = flow(function* (hasSeen: boolean) {
      self.welcome.hasSeen = hasSeen
    })

    const fetchHasSeen = flow(function* () {
      return self.welcome.hasSeen
    })

    return { setHasSeen, fetchHasSeen }
  })
