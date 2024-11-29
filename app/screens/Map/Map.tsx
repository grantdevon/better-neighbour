import { Alert, StyleSheet, View } from "react-native"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MapStackParamList } from "app/navigators"
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps"
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
        text1: "hold to drag marker",
        visibilityTime: 3000,
      })
      setCoords({
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
      })
    }
    setMapState(state)
  }

  const confirmEvent = (coords: { latitude: number; longitude: number }) => {
    Alert.alert(
      "Please confirm.",
      "Are you sure you would like to add a marker at this location?",
      [
        {
          text: "Yes",
          onPress: () =>
            navigation.navigate("Report", {
              coords: { lat: coords.latitude, lng: coords.longitude },
            }),
        },
        {
          text: "Cancel",
          onPress: () => {},
        },
      ],
    )
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
        {mapState === "Pin" ? (
          <Marker
            coordinate={coords}
            draggable={true}
            onDragEnd={(e) => confirmEvent(e.nativeEvent.coordinate)}
            onPress={(e) => confirmEvent(e.nativeEvent.coordinate)}
          >
            <View>
              <View style={{ backgroundColor: "white" }}>
                <Text
                  text="Tap or drag to set report location"
                  style={{ color: colors.palette.angry500 }}
                />
              </View>
              <Icon name="map-pin" type="feather" color={colors.palette.angry500} size={30} />
            </View>
          </Marker>
        ) : heatMapData.length > 0 ? (
          <Heatmap
            points={heatMapData}
            opacity={0.8}
            radius={300}
            gradient={{
              colors: ["#F29305", "#E50000"],
              startPoints: [0.3, 1],
              colorMapSize: 100,
            }}
          />
        ) : null}
      </MapView>
      <FAB
        onPress={pinPoint}
        placement="right"
        title={mapState === "HeatMap" ? "Make a report" : "HeatMap"}
        icon={{ name: mapState === "HeatMap" ? "warning" : "map", color: "white" }}
        color={colors.palette.angry500}
      />
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
})
