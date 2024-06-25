import { StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { observer } from 'mobx-react-lite'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppStackParamList } from 'app/navigators'

type settingsProps = NativeStackScreenProps<AppStackParamList, "Settings">


export const Settings: FC<settingsProps> = observer(() => {
    return (
        <View>
          <Text>Map</Text>
        </View>
      )
})

const styles = StyleSheet.create({})