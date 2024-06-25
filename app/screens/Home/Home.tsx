import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { observer } from 'mobx-react-lite'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppStackParamList } from 'app/navigators'

type homeProps = NativeStackScreenProps<AppStackParamList, "Home">


export const Home: FC<homeProps> = observer(() => {
    return (
        <View>
          <Text>Map</Text>
        </View>
      )
})

const styles = StyleSheet.create({})