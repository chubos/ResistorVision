import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import "../i18n";

function TabsLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Set system navigation bar color and style based on theme
  useEffect(() => {
    const updateNavigationBar = async () => {
      if (Platform.OS === 'android') {
        await SystemUI.setBackgroundColorAsync(colors.surface);
        // Set button style: 'dark' for light theme, 'light' for dark theme
        await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      }
    };
    updateNavigationBar();
  }, [colors.surface, isDark]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} animated={true} />
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vision"
        options={{
          title: t('tabs.vision'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabsLayout />
    </ThemeProvider>
  );
}

