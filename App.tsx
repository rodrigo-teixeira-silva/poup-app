import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { StoreProvider, useStore } from "./src/store";
import { C } from "./src/theme";
import HomeScreen from "./src/screens/HomeScreen";
import ResumoScreen from "./src/screens/ResumoScreen";
import MesScreen from "./src/screens/MesScreen";
import ParcelasScreen from "./src/screens/ParcelasScreen";
import ConfigScreen from "./src/screens/ConfigScreen";
import type { TabKey } from "./src/types";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const TABS: { key: TabKey; label: string; on: IconName; off: IconName }[] = [
  { key: "inicio", label: "Início", on: "home", off: "home-outline" },
  {
    key: "resumo",
    label: "Resumo",
    on: "stats-chart",
    off: "stats-chart-outline",
  },
  { key: "mes", label: "Mês", on: "calendar", off: "calendar-outline" },
  { key: "parcelas", label: "Parcelas", on: "layers", off: "layers-outline" },
  { key: "config", label: "Ajustes", on: "settings", off: "settings-outline" },
];

function Shell() {
  const { ready } = useStore();
  const [tab, setTab] = useState<TabKey>("inicio");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: C.bg,
        }}
      >
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: tab === "inicio" ? C.ink : C.bg }}
      edges={["top", "bottom"]}
    >
      <StatusBar style={tab === "inicio" ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {tab === "inicio" && <HomeScreen month={month} onNavigate={setTab} />}
        {tab === "resumo" && (
          <ResumoScreen
            onOpenMonth={(m) => {
              setMonth(m);
              setTab("mes");
            }}
          />
        )}
        {tab === "mes" && <MesScreen month={month} setMonth={setMonth} />}
        {tab === "parcelas" && <ParcelasScreen />}
        {tab === "config" && <ConfigScreen />}
      </View>

      <View style={s.bar}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable key={t.key} style={s.tab} onPress={() => setTab(t.key)}>
              <Ionicons
                name={on ? t.on : t.off}
                size={22}
                color={on ? C.ink : C.muted}
              />
              <Text
                style={[s.tabText, on && { color: C.ink, fontWeight: "800" }]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
    paddingTop: 8,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: "center", gap: 2 },
  tabText: { fontSize: 11, fontWeight: "600", color: C.muted },
});
