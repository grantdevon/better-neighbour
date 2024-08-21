import { User } from "app/models/User/User"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { Alert } from "react-native"

// Firebase model for authentication and Firestore operations
export const firebaseModel = {
  signIn: (email: string, password: string) => signIn(email, password),
  signUp: (user: User) => signUp(user),
  fetchDoc: (collection: string, docId: string) => fetchDocument(collection, docId),
  fetchDocByDate: (collection: string, date: string) => fetchDocumentsByDate(collection, date),
  sendDoc: (collection: string, docId: string, data: any) => sendDocument(collection, docId, data),
  createDoc: (collection: string, data: any) => createDocument(collection, data),
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
    console.log(res.user.uid)
    const now = new Date()
    const dateOptions = { year: "numeric", month: "short" }
    const dateJoined = now.toLocaleDateString("en-US", dateOptions)
    const userData = { ...user, dateJoined }
    const id = res.user.uid
    delete userData.password
    await sendDocument("users", id, { ...userData, id: id })
      .then((res) => console.log("Sign up collection hydrated!"))
      .catch((err) => console.log(err))
    // delete user if send doc returns err
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

const fetchDocumentsByDate = async (collection: string, dateValue: string): Promise<any[]> => {
  try {
    const querySnapshot = await firestore()
      .collection(collection)
      .where("date", "==", dateValue)
      .get()

    if (!querySnapshot.empty) {
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return documents
    } else {
      console.log("No matching documents found.")
      return []
    }
  } catch (err) {
    console.error("FetchDocumentsByDate Error: ", err)
    throw new Error(`FetchDocumentsByDate Error: ${err.message}`)
  }
}


// Function to send a document to Firestore
const sendDocument = async (collection: string, docId: string, data: any): Promise<void> => {
  try {
    await firestore().collection(collection).doc(docId).set(data)
    console.log("Document successfully written with ID: ")
  } catch (err) {
    console.error("SendDocument Error: ", err)
    throw new Error(`SendDocument Error: ${err.message}`)
  }
}

const createDocument = async (collection: string, data: any): Promise<void> => {
  try {
    await firestore().collection(collection).add(data)
    console.log("Document successfully written with ID: ")
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
