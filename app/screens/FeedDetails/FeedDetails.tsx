import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import { View, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE, Heatmap } from "react-native-maps"
import { Text } from "app/components"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import * as Location from "expo-location"

interface ReportDetails {
  coords: {
    lat: number
    lng: number
  }
  date: string
  time: string
  description: string
  location: string
  name: string
  reportType: string
}

interface FeedDetailsProps {
  route: {
    params: {
      report: ReportDetails
    }
  }
}

interface Coordinates {
  latitude: number
  longitude: number
}

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const FeedDetails = observer(({ route }: FeedDetailsProps) => {
  const { report } = route.params
  const navigation = useNavigation()

  const [distance, setDistance] = useState<number | null>(null)
  const [formattedTime, setFormattedTime] = useState<string>("")

  useEffect(() => {
    const getLocationAndCalculateDistance = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          console.log("Permission denied")
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        const userCoords = location.coords

        const calculatedDistance = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          report.coords.lat,
          report.coords.lng,
        )

        setDistance(calculatedDistance)
      } catch (error) {
        console.error("Error getting location:", error)
      }
    }

    const formatDateTime = () => {
      try {
        const [datePart, timePart] = report.date.split("T")
        const [hours, minutes] = report.time.split(":")
        const date = new Date(datePart)
        date.setHours(parseInt(hours), parseInt(minutes))

        const options: Intl.DateTimeFormatOptions = {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "GMT",
          timeZoneName: "short",
        }

        setFormattedTime(date.toLocaleTimeString("en-US", options))
      } catch (e) {
        console.error("Error formatting time:", e)
        setFormattedTime(`${report.time}`)
      }
    }

    getLocationAndCalculateDistance()
    formatDateTime()
  }, [])

  const getReportTypeIcon = (type) => {
    switch (type) {
      case "Power Outage":
        return "flash-outline"
      case "No Water":
        return "water-outline"
      case "Potholes":
        return "warning-outline"
      case "Internet Down":
        return "wifi-outline"
      case "Stray Pet":
        return "paw-outline"
      case "Street Lights":
        return "bulb-outline"
      case "Traffic Lights":
        return "stop-circle-outline"
      case "Strange Car":
        return "car-outline"
      case "Odd Behavior":
        return "people-outline"
      case "Crime":
        return "alert-circle-outline"
      case "Weird Activity":
        return "search-outline"
      case "Be Alert":
        return "warning-outline"
      case "Suspicious Activity":
        return "search-outline"
      default:
        return "alert-circle-outline"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.palette.neutral700} />
      </TouchableOpacity>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: report.coords.lat,
            longitude: report.coords.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: report.coords.lat,
              longitude: report.coords.lng,
            }}
          />
          <Heatmap
            points={[
              {
                latitude: report.coords.lat,
                longitude: report.coords.lng,
                weight: 1,
              },
            ]}
            radius={50}
            opacity={0.6}
            gradient={{
              colors: ["#00FF00", "#FF0000"],
              startPoints: [0.2, 0.8],
              colorMapSize: 2000,
            }}
          />
        </MapView>

        <View style={styles.distanceContainer}>
          <Icon name="location" size={20} color={colors.palette.primary500} />
          <Text style={styles.distanceText}>
            {distance !== null
              ? `${
                  distance < 1
                    ? `${(distance * 1000).toFixed(0)}m away`
                    : `${distance.toFixed(2)} km away`
                }`
              : "Calculating distance..."}
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.cardHeader}>
          <View style={styles.reportTypeContainer}>
            <Icon
              name={getReportTypeIcon(report.reportType)}
              size={24}
              color={colors.palette.primary500}
              style={styles.reportIcon}
            />
            <View>
              <Text style={styles.reportType}>{report.reportType}</Text>
              <Text style={styles.timestamp}>
                {formattedTime || `${report.date} • ${report.time}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color={colors.palette.primary500} />
            <Text style={styles.infoText}>{report.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location" size={20} color={colors.palette.primary500} />
            <Text style={styles.infoText}>{report.location}</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{report.description}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.neutral100,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: colors.palette.neutral100,
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mapContainer: {
    height: Dimensions.get("window").height * 0.45,
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  distanceContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  distanceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.palette.neutral700,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    marginTop: -25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 20,
  },
  reportTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportIcon: {
    backgroundColor: colors.palette.neutral200,
    padding: 12,
    borderRadius: 16,
    marginRight: 15,
  },
  reportType: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.palette.neutral800,
  },
  timestamp: {
    color: colors.palette.neutral500,
    fontSize: 13,
    marginTop: 4,
  },
  cardBody: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: colors.palette.neutral700,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.palette.neutral800,
    marginBottom: 10,
  },
  description: {
    fontSize: 11,
    color: colors.palette.neutral600,
    lineHeight: 20,
  },
})
