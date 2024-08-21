import { Alert, StyleSheet, Text, View } from "react-native"
import React, { FC, useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MapStackParamList } from "app/navigators"
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { FAB } from "@rneui/themed"
import { colors } from "app/theme"
import Geolocation from "@react-native-community/geolocation"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import { useFocusEffect } from "@react-navigation/native"

type mapProps = NativeStackScreenProps<MapStackParamList, "Map">

type ReportType = "Suspicous Activity" | "Crime"

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
    reportStore: { getReports, reports },
  } = useStores()
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 0,
    longitude: 0,
  })
  const [heatMapData, setHeatMapData] = useState<[]>([])
  const [report, setReport] = useState<ReportProps | null>(null)

  const pinPoint = () => {
    // setCoords({
    //   latitude: coords.latitude,
    //   longitude: coords.longitude,
    // })
    // show toast that says hold to move marker
    const state: MapState = mapState === "HeatMap" ? "Pin" : "HeatMap"
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
      await getReports("reports", getFormattedDate())
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
    Geolocation.getCurrentPosition(
      (result) => {
        setCoords({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        })
      },
      (err) => {
        setCoords({
          latitude: 0,
          longitude: 0,
        })
        Alert.alert("Could not find location. Please make sure the app has permission")
      },
    )
  }, [])

  useFocusEffect(
    useCallback(() => {
      updateMapData()
    }, []),
  )

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        // onRegionChangeComplete={(region) => {
        //   setCoords({
        //     latitude: region.latitude,
        //     longitude: region.longitude,
        //   })
        // }}
      >
        {mapState === "Pin" ? (
          <Marker
            draggable={true}
            coordinate={coords}
            onDragEnd={(e) => confirmEvent(e.nativeEvent.coordinate)}
            onPress={(e) => confirmEvent(e.nativeEvent.coordinate)}
          />
        ) : (
          <Heatmap
            points={heatMapData}
            opacity={0.8}
            radius={100}
            gradient={{
              colors: ["rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 1)"],
              startPoints: [0.1, 0.1, 1.0], // Adjust the distribution of colors
              colorMapSize: 256, // Size of the gradient color map
            }}
          />
        )}
      </MapView>
      <FAB
        onPress={pinPoint}
        placement="right"
        title={mapState === "HeatMap" ? "Report" : "HeatMap"}
        icon={{ name: mapState === "HeatMap" ? "warning" : "map", color: "white" }}
        color={colors.palette.primary}
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
