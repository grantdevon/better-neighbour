import { User } from "app/models/User/User"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { Alert } from "react-native"

// Firebase model for authentication and Firestore operations
export const firebaseModel = {
  signIn: (email: string, password: string) => signIn(email, password),
  signUp: (user: User) => signUp(user),
  fetchDoc: (collection: string, docId: string) => fetchDocument(collection, docId),
  sendDoc: (collection: string, data: any) => sendDocument(collection, data),
  updateDoc: (collection: string, docId: string, data: any) =>
    updateDocument(collection, docId, data),
}

// Function to sign in a user
const signIn = async (email: string, password: string): Promise<void> => {
  try {
    await auth().signInWithEmailAndPassword(email, password)
  } catch (err) {
    console.error("SignIn Error: ", err)
    Alert.alert("SignIn Error", err.message)
  }
}

// Function to sign up a new user
const signUp = async (user: User): Promise<void> => {
  try {
    const res = await auth().createUserWithEmailAndPassword(user.email, user.password)
    const userData = {...user}
    delete userData.password
    await sendDocument("users", {...userData, id: res.user.uid})
  } catch (err) {
    console.error("SignUp Error: ", err)
    Alert.alert("SignUp Error", err.message)
  }
}

// Function to fetch a document from Firestore
const fetchDocument = async (collection: string, docId: string): Promise<any> => {
  try {
    const documentSnapshot = await firestore().collection(collection).doc(docId).get()
    if (documentSnapshot.exists) {
      return documentSnapshot.data()
    } else {
      throw new Error("Document does not exist.")
    }
  } catch (err) {
    console.error("FetchDocument Error: ", err)
    throw new Error(`FetchDocument Error: ${err.message}`)
  }
}

// Function to send a document to Firestore
const sendDocument = async (collection: string, data: any): Promise<void> => {
  try {
    const documentRef = await firestore().collection(collection).add(data)
    console.log("Document successfully written with ID: ", documentRef.id)
  } catch (err) {
    console.error("SendDocument Error: ", err)
    throw new Error(`SendDocument Error: ${err.message}`)
  }
}

const updateDocument = async (collection: string, docId: string, data: any): Promise<void> => {
  try {
    await firestore().collection(collection).doc(docId).update(data)
    console.log("Document successfully updated.")
  } catch (err) {
    console.error("UpdateDocument Error: ", err)
    throw new Error(`UpdateDocument Error: ${err.message}`)
  }
}
