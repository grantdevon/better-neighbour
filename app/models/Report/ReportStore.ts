import { flow, types } from "mobx-state-tree"
import { ReportsModel } from "./Report"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { sortReports } from "app/utils/formatDate"

export const ReportStoreModel = types
  .model("ReportStoreModel")
  .props({
    reports: types.maybeNull(types.array(ReportsModel)),
    state: "",
  })
  .actions((self) => {
    const getReports = flow(function* (collection: string, date: string, userCoords, locations) {
      self.state = "pending"
      try {
        const result = yield firebaseModel.fetchDocumentsByDateAndLocations(collection, date, locations) 
        const sortedReports = sortReports(result, userCoords);
        self.reports = sortedReports
        self.state = "done"
      } catch (error) {
        console.log(error)
        self.reports = []
        self.state = "done"
      }
    })
    return { getReports }
  })
