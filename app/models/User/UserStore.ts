import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { UserModel } from "./User"
import auth from "@react-native-firebase/auth"

/**
 * A UserStore model.
 */
export const UserStoreModel = types
  .model("UserStore")
  .props({
    user: types.optional(UserModel, {}),
    state: "",
  })
  .actions((self) => {
    const signIn = flow(function* (email: string, password: string) {
      self.state = "pending"
    
      // ... yield can be used in async/await style
      self.state = "done"

      // The action will return a promise that resolves to the returned value
      // (or rejects with anything thrown from the action)
      return
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
    
    return { signIn, signUp }
  })

/**
 * The UserStore instance.
 */
export interface UserStore extends Instance<typeof UserStoreModel> {}
/**
 * The data of a UserStore.
 */
export interface UserStoreSnapshot extends SnapshotOut<typeof UserStoreModel> {}
