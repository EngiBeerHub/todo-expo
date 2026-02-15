import "../global.css";

import { Slot } from "expo-router";
import { type HeroUINativeConfig, HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * HeroUI Native の開発時設定。
 */
const config: HeroUINativeConfig = {
  devInfo: {
    // スタイリング指針の案内表示を無効化する
    stylingPrinciples: false,
  },
};
export default function Layout() {
  return (
    <GestureHandlerRootView>
      <HeroUINativeProvider config={config}>
        <Slot />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
