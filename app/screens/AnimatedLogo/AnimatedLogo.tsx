import React, { useEffect, useRef } from "react"
import { Animated, Easing } from "react-native"
import Svg, {
  Path,
  Line,
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
} from "react-native-svg"

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedLine = Animated.createAnimatedComponent(Line)

export const AnimatedLogo = ({ width = 201, height = 71, style }) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current
  const lineAnim = useRef(new Animated.Value(30.4727)).current

  useEffect(() => {
    // Pulse animation for the arc
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Line animation (moving up and down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, {
          toValue: 22.5625,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(lineAnim, {
          toValue: 30.4727,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  // Interpolate animation values
  const pathOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  })

  const pathStrokeWidth = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 28],
  })

  return (
    <Svg width={width} height={height} viewBox="0 0 201 71" fill="none" style={style}>
      <Defs>
        <Filter
          id="filter0_d_4349_2901"
          x="0.89691"
          y="0.821875"
          width="199.213"
          height="69.7586"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <FeFlood floodOpacity="0" result="BackgroundImageFix" />
          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <FeOffset dy="4" />
          <FeGaussianBlur stdDeviation="2.3" />
          <FeComposite in2="hardAlpha" operator="out" />
          <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4349_2901" />
          <FeBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4349_2901"
            result="shape"
          />
        </Filter>
      </Defs>

      <AnimatedPath
        d="M18 49.4684L90.4658 16.2833C97.4122 13.1022 105.403 13.1352 112.318 16.3735L183.007 49.4784"
        stroke="#006FFD"
        strokeWidth={pathStrokeWidth}
        strokeLinecap="round"
        filter="url(#filter0_d_4349_2901)"
        opacity={pathOpacity}
      />

      <AnimatedLine
        x1="39.6588"
        y1={lineAnim}
        x2="39.6588"
        y2={30.4727}
        stroke="#006FFD"
        strokeWidth="25"
        strokeLinecap="square"
      />
    </Svg>
  )
}
