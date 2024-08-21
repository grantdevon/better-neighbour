import { flow, types } from "mobx-state-tree"
import { ReportsModel } from "./Report"
import { firebaseModel } from "app/services/Firebase/firebase.service"

export const ReportStoreModel = types
  .model("ReportStoreModel")
  .props({
    reports: types.array(ReportsModel),
    state: "",
  })
  .actions((self) => {
    const getReports = flow(function* (collection: string, date: string) {
      self.state = "pending"
      try {
        const result = yield firebaseModel.fetchDocByDate(collection, date)
        console.log(result);
        
        self.reports = result
        self.state = "done"
      } catch (error) {
        console.log(error)

        self.reports = []
        self.state = "done"
      }
    })
    return { getReports }
  })
