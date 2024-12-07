import { Button } from "app/components"
import { useStores } from "app/models"
import { firebaseModel } from "app/services/Firebase/firebase.service"
import { colors } from "app/theme"
import { getFormattedDate } from "app/utils/formatDate"
import { useHeader } from "app/utils/useHeader"
import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
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
// import analytics from "@react-native-firebase/analytics"

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

// Interface for Nominatim reverse geocoding response
interface NominatimResponse {
  address: {
    suburb?: string
    city_district?: string
    county?: string
    town?: string
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
  const [locationLoading, setLocationLoading] = useState<boolean>(true)

  /**
   * For dropdown
   */
  const [value, setValue] = useState<string | null>(null)

  /**
   * for location input
   */
  const [locationValue, setLocationValue] = useState<string | null>(null)
  const [isLocationAutoDetected, setIsLocationAutoDetected] = useState<boolean>(false)

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

  /**
   * Fetch location using Nominatim reverse geocoding
   * Handles different address formats and fallbacks
   */
  const fetchLocationFromCoords = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error("Nominatim API request failed")
      }

      const data: NominatimResponse = await response.json()

      console.log(data);
      

      // Prioritize suburb, then city_district, then county
      const location = data.address.town || data.address.suburb || data.address.county || data.address.city_district 

      // Verify the location is in South Africa (basic validation)
      if (location) {
        return location
      }

      return null
    } catch (error) {
      console.error("Error fetching location:", error)
      return null
    }
  }

  /**
   * Auto-fetch location when component mounts
   */
  useEffect(() => {
    const autoFetchLocation = async () => {
      try {
        setLocationLoading(true)
        const location = await fetchLocationFromCoords(coords.lat, coords.lng)
        console.log(location)

        if (location) {
          setLocationValue(location)
          setIsLocationAutoDetected(true)
        }
      } catch (error) {
        console.error("Location auto-fetch error:", error)
        Alert.alert("Location Error", "Could not automatically detect location.")
      } finally {
        setLocationLoading(false)
      }
    }

    autoFetchLocation()
  }, [coords])

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
        console.log("====================================")
        console.log("locations ", data.location)
        console.log("====================================")
        // await analytics().logEvent("make_report", {
        //   id: user.id,
        //   name: user.firstName,
        // })
        if (locations.length > 0) {
          await getReports("reports", getFormattedDate(), coords, locations)
        } else {
          await getReports("reports", getFormattedDate(), coords, [data.location])
        }
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

  // Location loading state
  if (locationLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.palette.neutral200,
        }}
      >
        <ActivityIndicator size={"large"} color={colors.palette.neutral800} />
        <Text>Detecting location...</Text>
      </SafeAreaView>
    )
  }

  // Report submission loading state
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.palette.neutral200,
        }}
      >
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
            style={[styles.dropdown, { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            data={dropDownData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!value ? "Select item" : "..."}
            value={value}
            onChange={(item) => {
              setValue(item.value)
            }}
          />

          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            value={locationValue || ""}
            editable={!isLocationAutoDetected}
            style={[styles.input, isLocationAutoDetected && styles.autoDetectedInput]}
            placeholder={isLocationAutoDetected ? "" : "Enter Location"}
            // onChangeText={setLocationValue}
          />
          {isLocationAutoDetected && (
            <Text style={styles.autoDetectedText}>Location auto-detected from coordinates</Text>
          )}

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
    paddingHorizontal: 10,
    backgroundColor: colors.palette.neutral200,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 15,
    borderColor: "grey",
    paddingHorizontal: 10,
  },
  autoDetectedInput: {
    backgroundColor: colors.palette.neutral300,
    color: colors.palette.neutral700,
  },
  autoDetectedText: {
    fontSize: 12,
    color: colors.palette.neutral600,
    marginTop: 5,
    marginBottom: 10,
  },
  inputDescription: {
    borderWidth: 1,
    borderRadius: 7,
    borderColor: "grey",
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: 15,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "bold",
    marginVertical: 10,
  },
  buttonContainer: {
    marginVertical: 50,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
})
