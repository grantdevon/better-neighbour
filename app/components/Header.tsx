import React, { ReactElement } from "react";
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isRTL, translate } from "../i18n";
import { colors, spacing } from "../theme";
import { ExtendedEdge, useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle";
import { Text, TextProps } from "./Text";

interface HeaderActionProps {
  backgroundColor?: string;
  icon?: string;
  iconColor?: string;
  text?: TextProps["text"];
  tx?: TextProps["tx"];
  txOptions?: TextProps["txOptions"];
  onPress?: TouchableOpacityProps["onPress"];
  ActionComponent?: ReactElement;
}

export function Header(props) {
  const {
    backgroundColor = "#ffffff",
    LeftActionComponent,
    leftIcon,
    leftIconColor,
    leftText,
    leftTx,
    leftTxOptions,
    onLeftPress,
    onRightPress,
    RightActionComponent,
    rightIcon,
    rightIconColor,
    rightText,
    rightTx,
    rightTxOptions,
    safeAreaEdges = ["top"],
    title,
    titleMode = "center",
    titleTx,
    titleTxOptions,
    titleContainerStyle: $titleContainerStyleOverride,
    style: $styleOverride,
    titleStyle: $titleStyleOverride,
    containerStyle: $containerStyleOverride,
  } = props;

  const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges);

  const titleContent = titleTx ? translate(titleTx, titleTxOptions) : title;

  return (
    <View style={[$container, $containerInsets, { backgroundColor }, $containerStyleOverride]}>
      <View style={[$wrapper, $styleOverride]}>
        <HeaderAction
          tx={leftTx}
          text={leftText}
          icon={leftIcon}
          iconColor={leftIconColor}
          onPress={onLeftPress}
          txOptions={leftTxOptions}
          backgroundColor={backgroundColor}
          ActionComponent={LeftActionComponent}
        />

        {!!titleContent && (
          <View
            style={[
              titleMode === "center" && $titleWrapperCenter,
              titleMode === "flex" && $titleWrapperFlex,
              $titleContainerStyleOverride,
            ]}
            pointerEvents="none"
          >
            <Text
              weight="medium"
              size="md"
              text={titleContent}
              style={[$title, $titleStyleOverride]}
            />
          </View>
        )}

        <HeaderAction
          tx={rightTx}
          text={rightText}
          icon={rightIcon}
          iconColor={rightIconColor}
          onPress={onRightPress}
          txOptions={rightTxOptions}
          backgroundColor={backgroundColor}
          ActionComponent={RightActionComponent}
        />
      </View>
    </View>
  );
}

function HeaderAction(props: HeaderActionProps) {
  const { backgroundColor, icon, text, tx, txOptions, onPress, ActionComponent, iconColor } = props;

  const content = tx ? translate(tx, txOptions) : text;

  if (ActionComponent) return ActionComponent;

  if (content) {
    return (
      <TouchableOpacity
        style={[$actionTextContainer, { backgroundColor }]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.8}
      >
        {icon && <Ionicons name={icon} size={24} color={iconColor || colors.palette.neutral800} />}
        <Text weight="medium" size="md" text={content} style={$actionText} />
      </TouchableOpacity>
    );
  }

  return <View style={[$actionFillerContainer, { backgroundColor }]} />;
}

const $wrapper: ViewStyle = {
  height: 56,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

const $container: ViewStyle = {
  width: "100%",
};

const $title: TextStyle = {
  textAlign: "center",
};

const $actionTextContainer: ViewStyle = {
  flexGrow: 0,
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  paddingHorizontal: spacing.md,
  zIndex: 2,
  flexDirection: "row",
};

const $actionText: TextStyle = {
  color: colors.palette.neutral800,
  paddingLeft: spacing.xs,
  fontSize: 13,
  fontWeight: "bold",
};

const $actionIconContainer: ViewStyle = {
  flexGrow: 0,
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  paddingHorizontal: spacing.md,
  zIndex: 2,
};

const $actionFillerContainer: ViewStyle = {
  width: 16,
};

const $titleWrapperCenter: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",
  position: "absolute",
  paddingHorizontal: spacing.xxl,
  zIndex: 1,
};

const $titleWrapperFlex: ViewStyle = {
  justifyContent: "center",
  flexGrow: 1,
};
