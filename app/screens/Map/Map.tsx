import { StyleSheet, View, TouchableOpacity } from "react-native"
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
import { Text } from "app/components"

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
    userStore: { locations },
    reportStore: { getReports, reports },
  } = useStores()

  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 0,
    longitude: 0,
  })
  const mapRef = useRef<MapView>(null)

  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  })
  const [heatMapData, setHeatMapData] = useState<[]>([])

  const [location, setLocation] = useState<Location.LocationObject | null>(null)

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

  const updateMapData = async () => {
    try {
      let coords = { lat: location?.coords.latitude, lng: location?.coords.longitude }
      if (locations.length > 0) {
        await getReports("reports", getFormattedDate(), coords, locations)
      }
      if (reports) {
        let tempHeatMapArr: [] = []
        reports.forEach((report) => {
          tempHeatMapArr.push({
            latitude: report.coords.lat,
            longitude: report.coords.lng,
            weight: 10,
            text: "string",
          })
        })
        setHeatMapData(tempHeatMapArr)
      }
    } catch (error) {
      console.error(error)
      setHeatMapData([])
    }
  }

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied")
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      setLocation(location)
    }

    getCurrentLocation()
  }, [])

  useFocusEffect(
    useCallback(() => {
      updateMapData()
    }, []),
  )

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        mapType="standard"
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        zoomEnabled
        onRegionChangeComplete={(region) => setCurrentRegion(region)}
        maxZoomLevel={17}
      >
        {heatMapData.length > 0 && mapState === "HeatMap" ? (
          <Heatmap
            points={heatMapData}
            opacity={0.8}
            radius={50}
            gradient={{
              colors: ["#F29305", "#E50000"],
              startPoints: [0.3, 1],
              colorMapSize: 100,
            }}
          />
        ) : null}
      </MapView>

      {mapState === "Pin" && (
        <View style={styles.pinContainer}>
          <View style={styles.pinWrapper}>
            <Icon 
              name="map-pin" 
              type="feather" 
              color={colors.palette.angry500} 
              size={40} 
            />
          </View>
        </View>
      )}

      {mapState === "Pin" && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetContent}>
            <Text 
              text="Set Report Location" 
              style={styles.bottomSheetTitle}
            />
            <Text 
              text="Move the map to position your pin" 
              style={styles.bottomSheetSubtitle}
            />
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={confirmEvent}
            >
              <Text 
                text="Confirm Location" 
                style={styles.confirmButtonText}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={cancelPinMode}
            >
              <Text 
                text="Cancel" 
                style={styles.cancelButtonText}
              />
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
            color: "white" 
          }}
          color={colors.palette.angry500}
        />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinWrapper: {
    marginBottom: 100,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetContent: {
    padding: 20,
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomSheetSubtitle: {
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: colors.palette.angry500,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.palette.angry500,
  },
  cancelButtonText: {
    color: colors.palette.angry500,
    fontWeight: 'bold',
    fontSize: 16,
  },
})