import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "app/navigators"
import { useHeader } from "app/utils/useHeader"
import { FlatList } from "react-native-gesture-handler"
import { useStores } from "app/models"
import { getFormattedDate } from "app/utils/formatDate"
import MapView, { Heatmap, PROVIDER_GOOGLE } from "react-native-maps"
import { Button } from "app/components"
import { colors } from "app/theme"
import { useFocusEffect } from "@react-navigation/native"

type homeProps = NativeStackScreenProps<AppStackParamList, "Home">

export const Home: FC<homeProps> = observer(() => {
  useHeader({
    title: "better-neighbour",
    titleStyle: { color: colors.palette.primary, fontWeight: 'bold', fontSize: 20 },
    titleMode: "flex",
    containerStyle: { backgroundColor: colors.palette.neutral100 },
  })

  const {
    reportStore: { getReports, reports },
  } = useStores()

  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const updateHomePageData = async () => {
    try {
      await getReports("reports", getFormattedDate())
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await updateHomePageData()
    setRefreshing(false)
  }

  const Header = ({ text }: { text: string }) => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{text}</Text>
      </View>
    )
  }

  const RenderCards = ({ item }) => {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.nameText}>
          {item.name} just reported {item.reportType}
        </Text>
        <Text style={styles.locationText}>in {item.location}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
        
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={{
            latitude: item.coords.lat,
            longitude: item.coords.lng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          cacheEnabled
          scrollEnabled={false}
        >
          <Heatmap
            points={[
              {
                latitude: item.coords.lat,
                longitude: item.coords.lng,
                weight: 1,
              },
            ]}
            opacity={0.8}
            radius={100}
            gradient={{
              colors: ["rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 1)"],
              startPoints: [0.1, 0.1, 1.0],
              colorMapSize: 256,
            }}
          />
        </MapView>
  
        {/* <Button preset="filled" text="trust 👍" style={styles.button} /> */}
      </View>
    )
  }

  useFocusEffect(() => {
    setLoading(true)
    updateHomePageData()
    setLoading(false)
  })

  if (loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header text={"Today's activity"} />
      <FlatList
        data={reports}
        renderItem={RenderCards}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.palette.primary]}
          />
        }
        ListEmptyComponent={() => {
          return (
            <View>
              <Text>No data</Text>
            </View>
          )
        }}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerContainer: {
    marginVertical: 20
  },
  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.palette.primary
  },
  cardContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  map: {
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    alignSelf: "center",
    backgroundColor: "#0044cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
})
