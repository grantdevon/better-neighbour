import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { UserModel } from "./User"
import auth from "@react-native-firebase/auth"
import { firebaseModel } from "app/services/Firebase/firebase.service"

/**
 * A UserStore model.
 */
export const UserStoreModel = types
  .model("UserStore")
  .props({
    user: types.optional(UserModel, {}),
    state: "",
    locations: types.optional(types.array(types.string), []),
  })
  .actions((self) => {
    const getUser = flow(function* (userId: string) {
      self.state = "pending"
      const user = yield firebaseModel.fetchDoc("users", userId)
      // ... yield can be used in async/await style
      self.user = user
      self.state = "done"

      // The action will return a promise that resolves to the returned value
      // (or rejects with anything thrown from the action)
      return user
    })

    const signOut = flow(function* () {
      self.state = "pending"
      auth().signOut()

      // ... yield can be used in async/await style
      self.state = "done"

      // The action will return a promise that resolves to the returned value
      // (or rejects with anything thrown from the action)
      return true
    })

    const signUp = flow(function* (email: string, password: string, user: any) {
      self.state = "pending"
      auth()
        .createUserWithEmailAndPassword("jane.doe@example.com", "SuperSecretPassword!")
        .then(() => {
          console.log("User account created & signed in!")
        })
        .catch((error) => {
          self.state = "error"
          if (error.code === "auth/email-already-in-use") {
            console.log("That email address is already in use!")
          }

          if (error.code === "auth/invalid-email") {
            console.log("That email address is invalid!")
          }

          console.error(error)
        })
      // ... yield can be used in async/await style
      self.state = "done"

      // The action will return a promise that resolves to the returned value
      // (or rejects with anything thrown from the action)
      return
    })
    const addLocation = (location: string | string[]) => {
      try {
        const locationsToAdd = Array.isArray(location) ? location : [location]
        locationsToAdd.forEach((loc) => {
          if (!self.locations.includes(loc)) {
            self.locations.push(loc)
          }
        })
      } catch (error) {
        console.error("Error adding location:", error)
      }
    }

    const removeLocation = (location: string) => {
      self.locations = self.locations.filter((loc) => loc !== location)
    }

    const clearLocations = () => {
      self.locations.clear()
    }

    return { getUser, signUp, signOut, addLocation, removeLocation, clearLocations }
  })

/**
 * The UserStore instance.
 */
export interface UserStore extends Instance<typeof UserStoreModel> {}
/**
 * The data of a UserStore.
 */
export interface UserStoreSnapshot extends SnapshotOut<typeof UserStoreModel> {}
