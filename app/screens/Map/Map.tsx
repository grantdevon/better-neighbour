import { StyleSheet, View, TouchableOpacity, Alert, Linking, ActivityIndicator } from "react-native"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MapStackParamList } from "app/navigators"
import MapView, { Heatmap, PROVIDER_GOOGLE, Region } from "react-native-maps"
import { FAB, Icon } from "@rneui/themed"
import { colors } from "app/theme"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { useFocusEffect } from "@react-navigation/native"
import * as Location from "expo-location"
import Toast from "react-native-toast-message"
import { Button, Text } from "app/components"
import { fetchLocationFromCoords } from "app/utils/map"

type mapProps = NativeStackScreenProps<MapStackParamList, "Map">

type ReportType = "Suspicious Activity" | "Crime" | "Be Alert"

type MapState = "Pin" | "HeatMap"

interface ReportProps {
  id: string
  userId: string
  name: string
  surname: string
  location: string
  dateAndTime: string
  description: string
  reportType: ReportType
  coords: { latitude: number; longitude: number }
}

export const Map: FC<mapProps> = observer(({ navigation }) => {
  const {
    mapStore: { mapState, setMapState },
    reportStore: { getProvinceReports, reports },
  } = useStores()

  // Default to Cape Town coordinates
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: -33.9249, // Cape Town latitude
    longitude: 18.4241, // Cape Town longitude
  })

  const mapRef = useRef<MapView>(null)

  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: -33.9249, // Default to Cape Town
    longitude: 18.4241,
    latitudeDelta: 0.05, // Increased for better initial view
    longitudeDelta: 0.05,
  })

  const [heatMapData, setHeatMapData] = useState<[]>([])
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [locationPermission, setLocationPermission] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [dataLoading, setDataLoading] = useState<boolean>(true)

  // Initial data load - will use default Cape Town location
  // useEffect(() => {
  //   loadInitialHeatmapData()
  // }, [])

  // Try to get location and update map when component mounts
  useEffect(() => {
    requestLocationAndUpdateMap()
  }, [])

  // Load heatmap with default location
  const loadInitialHeatmapData = async () => {
    setDataLoading(true)
    try {
      // Default Cape Town coords for initial load
      const defaultCoords = { lat: -33.9249, lng: 18.4241 }
      await getProvinceReports("reports", getFormattedDate(), defaultCoords, "Cape Town")

      if (reports && reports.length > 0) {
        updateHeatMapFromReports(reports)
        Toast.show({
          type: "info",
          text1: "Showing reports for Cape Town",
          text2: "Getting your precise location...",
          visibilityTime: 3000,
        })
      } else {
        Toast.show({
          type: "info",
          text1: "No reports found in this area",
          text2: "Try making a new report",
          visibilityTime: 3000,
        })
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
      Toast.show({
        type: "error",
        text1: "Error loading reports",
        text2: "Please pull to refresh",
        visibilityTime: 3000,
      })
    } finally {
      setDataLoading(false)
    }
  }

  // Update heatmap data from reports
  const updateHeatMapFromReports = (reportData) => {
    if (!reportData || reportData.length === 0) {
      setHeatMapData([])
      return
    }

    const tempHeatMapArr: any = []
    reportData.forEach((report) => {
      tempHeatMapArr.push({
        latitude: report.coords.lat,
        longitude: report.coords.lng,
        weight: 30, // Increased weight for better visibility
        radius: 25, // Added custom radius per point if supported
      })
    })
    setHeatMapData(tempHeatMapArr)
  }

  // Request location permission and update map
  const requestLocationAndUpdateMap = async () => {
    setIsLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Alert!", "Permission to access location was denied")
        setLocationPermission(false)
        setIsLoading(false)
        return
      }

      // Use a timeout to ensure we don't wait too long
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      // Set a timeout for location fetch (8 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Location timeout")), 8000),
      )

      // Race between location fetch and timeout
      try {
        const location = (await Promise.race([
          locationPromise,
          timeoutPromise,
        ])) as Location.LocationObject
        setLocation(location)
        setCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        // Animate to user location
        mapRef.current?.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          1000,
        )

        // Update data with actual location
        updateMapDataWithLocation(location)
      } catch (err) {
        console.log("Location timeout or error, using default data", err)
        // We already loaded with default data, so just show a message
        Toast.show({
          type: "info",
          text1: "Location services unavailable",
          text2: "Showing default location data",
          visibilityTime: 3000,
        })
      }
    } catch (error) {
      console.error("Error getting location:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update map data with user's actual location
  const updateMapDataWithLocation = async (userLocation: Location.LocationObject) => {
    try {
      setDataLoading(true)
      const coords = {
        lat: userLocation.coords.latitude,
        lng: userLocation.coords.longitude,
      }

      const province = await fetchLocationFromCoords(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
      )

      await getProvinceReports(
        "reports",
        getFormattedDate(),
        coords,
        province || "Current Location",
      )

      if (reports) {
        updateHeatMapFromReports(reports)

        Toast.show({
          type: "success",
          text1: `Showing reports near ${province || "your location"}`,
          visibilityTime: 3000,
        })
      }
    } catch (error) {
      console.error("Error updating with location:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const pinPoint = () => {
    const state: MapState = mapState === "HeatMap" ? "Pin" : "HeatMap"
    if (mapState === "HeatMap") {
      Toast.show({
        type: "info",
        text1: "Move the map to place your pin",
        text2: "The pin will be at the center of the screen",
        visibilityTime: 5000,
      })
      setCoords({
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
      })
    }
    setMapState(state)
  }

  const confirmEvent = () => {
    navigation.navigate("Report", {
      coords: { lat: currentRegion.latitude, lng: currentRegion.longitude },
    })
  }

  const cancelPinMode = () => {
    setMapState("HeatMap")
  }

  const refreshMapData = async () => {
    setDataLoading(true)
    console.log("====================================")
    console.log("LOCATION ", location)
    console.log("====================================")
    try {
      if (location) {
        // Use actual location if available
        await updateMapDataWithLocation(location)
      } else {
        // Fall back to current map region
        const coords = {
          lat: currentRegion.latitude,
          lng: currentRegion.longitude,
        }

        await getProvinceReports(
          "reports",
          getFormattedDate(),
          coords,
          "Cape Winelands District Municipality",
        )

        if (reports) {
          updateHeatMapFromReports(reports)
        }
      }
    } catch (error) {
      console.error("Error refreshing map data:", error)
      Toast.show({
        type: "error",
        text1: "Failed to refresh data",
        visibilityTime: 3000,
      })
    } finally {
      setDataLoading(false)
    }
  }

  const confirmSettings = () => {
    Alert.alert("Alert!", "Please restart your app after granting access.", [
      {
        text: "I understand",
        onPress: () => Linking.openSettings(),
      },
    ])
  }

  useFocusEffect(
    useCallback(() => {
      // Fetch data when the screen is focused
      refreshMapData()

      // Optional: Cleanup function if needed
      return () => {
        console.log("Screen unfocused")
      }
    }, [location]),
  )
  if (!locationPermission) {
    return (
      <View style={styles.noPermissioncontainer}>
        <Text
          preset="heading"
          text="Please make sure location permission has been granted"
          size="lg"
          weight="medium"
        />
        <Button preset="filled" text="Allow" onPress={confirmSettings} style={styles.button} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        mapType="standard"
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentRegion}
        zoomEnabled
        onRegionChangeComplete={(region) => setCurrentRegion(region)}
        maxZoomLevel={17}
      >
        {heatMapData.length > 0 && mapState === "HeatMap" ? (
          <Heatmap
            points={heatMapData}
            opacity={0.8}
            radius={50} // Increased for better visibility
            gradient={{
              colors: ["#FFA500", "#F29305", "#E50000"], // Added orange for better gradient
              startPoints: [0.1, 0.5, 1],
              colorMapSize: 256, // Increased for smoother gradients
            }}
          />
        ) : null}
      </MapView>

      {/* Loading indicators */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      {dataLoading && !isLoading && (
        <View style={styles.dataLoadingIndicator}>
          <ActivityIndicator size="small" color="white" />
          <Text style={styles.dataLoadingText}>Loading reports...</Text>
        </View>
      )}

      {/* User location button */}
      {!isLoading && (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={() => {
            if (location) {
              mapRef.current?.animateToRegion(
                {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                },
                1000,
              )
            } else {
              Toast.show({
                type: "info",
                text1: "Location not available",
                visibilityTime: 2000,
              })
            }
          }}
        >
          <Icon name="my-location" type="material" color={colors.palette.neutral800} size={24} />
        </TouchableOpacity>
      )}

      {/* Refresh data button */}
      {!isLoading && !dataLoading && (
        <TouchableOpacity style={styles.refreshButton} onPress={refreshMapData}>
          <Icon name="refresh" type="material" color={colors.palette.neutral800} size={24} />
        </TouchableOpacity>
      )}

      {mapState === "Pin" && (
        <View style={styles.pinContainer}>
          <View style={styles.pinWrapper}>
            <Icon name="map-pin" type="feather" color={colors.palette.angry500} size={40} />
          </View>
        </View>
      )}

      {mapState === "Pin" && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetContent}>
            <Text text="Set Report Location" style={styles.bottomSheetTitle} />
            <Text text="Move the map to position your pin" style={styles.bottomSheetSubtitle} />
            <TouchableOpacity style={styles.confirmButton} onPress={confirmEvent}>
              <Text text="Confirm Location" style={styles.confirmButtonText} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelPinMode}>
              <Text text="Cancel" style={styles.cancelButtonText} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {mapState === "HeatMap" && (
        <FAB
          onPress={pinPoint}
          placement="right"
          title="Make a report"
          icon={{
            name: "warning",
            color: "white",
          }}
          color={colors.palette.angry500}
        />
      )}

      {/* Heatmap legend when heatmap has data */}
      {mapState === "HeatMap" && heatMapData.length > 0 && (
        <View style={styles.heatmapLegend}>
          <Text style={styles.legendTitle}>Report Density</Text>
          <View style={styles.legendGradient}>
            <Text style={styles.legendText}>Low</Text>
            <View style={styles.gradientBar}>
              {/* Replace LinearGradient with a simple colored bar */}
              <View style={styles.colorBar}>
                <View style={[styles.colorSegment, { backgroundColor: "#0000FF", flex: 1 }]} />
                {/* Blue for low */}
                <View style={[styles.colorSegment, { backgroundColor: "#00FF00", flex: 1 }]} />
                {/* Green for medium */}
                <View style={[styles.colorSegment, { backgroundColor: "#FF0000", flex: 1 }]} />
                {/* Red for high */}
              </View>
            </View>
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinContainer: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  pinWrapper: {
    marginBottom: 100,
  },
  noPermissioncontainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 20,
    width: "100%",
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    elevation: 5,
    left: 0,
    paddingBottom: 20,
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomSheetContent: {
    alignItems: "center",
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bottomSheetSubtitle: {
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: colors.palette.angry500,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: "100%",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    alignItems: "center",
    borderColor: colors.palette.angry500,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: "100%",
  },
  cancelButtonText: {
    color: colors.palette.angry500,
    fontSize: 16,
    fontWeight: "bold",
  },
  // Add these to your existing styles object

  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  loadingText: {
    color: colors.palette.neutral800,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  dataLoadingIndicator: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    position: "absolute",
    top: 20,
    zIndex: 100,
  },
  dataLoadingText: {
    color: "white",
    fontSize: 14,
    marginLeft: 8,
  },
  myLocationButton: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 23,
    bottom: 140,
    elevation: 4,
    height: 46,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 46,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 23,
    bottom: 196,
    elevation: 4,
    height: 46,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 46,
  },
  heatmapLegend: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 3,
    left: 20,
    padding: 10,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    top: 50,
  },
  legendTitle: {
    color: colors.palette.neutral800,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  legendGradient: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gradientBar: {
    borderRadius: 5,
    flex: 1,
    height: 10,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  legendText: {
    color: colors.palette.neutral600,
    fontSize: 10,
  },
  colorBar: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  colorSegment: {
    height: "100%",
  },
})
