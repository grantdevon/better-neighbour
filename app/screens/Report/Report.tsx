import { Button } from "app/components"
import { useStores } from "app/models"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { colors } from "app/theme"
import { getFormattedDate } from "app/utils/formatDate"
import { southAfricaSuburbs } from "app/utils/location"
import { useHeader } from "app/utils/useHeader"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import { TextInput } from "react-native-gesture-handler"

type ReportType = "Suspicious Activity" | "Crime" | "Be Alert"

interface IReportType {
  label: ReportType
  value: string
}

interface IReport {
  userId: string
  name: string
  location: string | null
  reportType: string
  date: string
  description: string
  coords: ICoords
  time: string
}

interface ICoords {
  coords: {
    lat: number
    lng: number
  }
}

export const Report: FC = observer(({ navigation, route }) => {
  const { coords } = route?.params

  const {
    mapStore: { setMapState },
    userStore: { user, locations },
    reportStore: { getReports },
  } = useStores()

  const [description, setDescription] = useState<string>("")

  const [loading, setLoading] = useState<boolean>(false)

  /**
   * For dropdown
   */
  const [value, setValue] = useState<string | null>(null)
  const [isFocus, setIsFocus] = useState<boolean>(false)

  /**
   * for location drop down
   */
  const [locationValue, setLocationValue] = useState<string | null>(null)
  const [isLocationInFocus, setIsLocationInFocus] = useState<boolean>(false)

  const dropDownData: IReportType[] = [
    { label: "Suspicious Activity", value: "Suspicious Activity" },
    { label: "Crime", value: "Crime" },
    { label: "Be Alert", value: "Be Alert" },
  ]

  useHeader(
    {
      title: "Make a report",
      leftIcon: "back",
      onLeftPress: () => navigation.navigate("Map"),
    },
    [],
  )

  const validated = (): boolean => {
    if (!value) return false
    if (!locationValue) return false
    if (!description) return false
    return true
  }

  const makeReport = async () => {
    if (validated()) {
      const data: IReport = {
        userId: user.id,
        name: user.firstName,
        description: description,
        location: locationValue,
        reportType: value as string,
        date: getFormattedDate(),
        time: new Date().toTimeString(),
        coords: coords,
      }
      try {
        setLoading(true)
        await firebaseModel.createDoc("reports", data)
        await getReports("reports", getFormattedDate(), coords, locations)
        setMapState("HeatMap")
        navigation.navigate("Map")
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
        Alert.alert("Error", "There was a problem making your report. Please try again later.")
      }
    } else {
      Alert.alert("Alert", "Please make sure all the values are filled in.")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} color={colors.palette.neutral800} />
        <Text>Making a report...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <Text style={styles.inputLabel}>Report Type</Text>
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            data={dropDownData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? "Select item" : "..."}
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
              setValue(item.value)
              setIsFocus(false)
            }}
          />
          <Text style={styles.inputLabel}>Location</Text>
          <Dropdown
            style={[styles.dropdown, isLocationInFocus && { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            search
            data={southAfricaSuburbs}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isLocationInFocus ? "Select Location" : "..."}
            value={locationValue}
            onFocus={() => setIsLocationInFocus(true)}
            onBlur={() => setIsLocationInFocus(false)}
            onChange={(item) => {
              setLocationValue(item.value)
              setIsLocationInFocus(false)
            }}
          />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            maxLength={250}
            multiline
            placeholder="Describe the scene"
            value={description}
            onChangeText={setDescription}
            style={styles.inputDescription}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            preset="filled"
            text="Make Report"
            onPress={makeReport}
            style={{ backgroundColor: colors.palette.primary400, borderRadius: 10 }}
            textStyle={{ color: colors.palette.neutral100 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 15,
    borderColor: "grey",
    paddingHorizontal: 10,
  },
  inputDescription: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: "grey",
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: 15
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "bold",
    marginVertical: 10,
  },
  buttonContainer: {
    marginVertical: 50,
  },
})
