import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Modal, Text, TouchableOpacity, Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import ResistanceResult from "@/components/ResistanceResult";
import ResistorDisplay from "@/components/ResistorDisplay";
import BandCountSelector from "@/components/BandCountSelector";
import ColorSelector from "@/components/ColorSelector";

const RESISTOR_COLORS = {
  black: { value: 0, multiplier: 1, tolerance: null, tempCoeff: null, color: "#000000" },
  brown: { value: 1, multiplier: 10, tolerance: 1, tempCoeff: 100, color: "#8B4513" },
  red: { value: 2, multiplier: 100, tolerance: 2, tempCoeff: 50, color: "#FF0000" },
  orange: { value: 3, multiplier: 1000, tolerance: null, tempCoeff: 15, color: "#FFA500" },
  yellow: { value: 4, multiplier: 10000, tolerance: null, tempCoeff: 25, color: "#FFFF00" },
  green: { value: 5, multiplier: 100000, tolerance: 0.5, tempCoeff: 20, color: "#009e00" },
  blue: { value: 6, multiplier: 1000000, tolerance: 0.25, tempCoeff: 10, color: "#0000FF" },
  violet: { value: 7, multiplier: 10000000, tolerance: 0.1, tempCoeff: 5, color: "#8B00FF" },
  gray: { value: 8, multiplier: 100000000, tolerance: 0.05, tempCoeff: 1, color: "#808080" },
  white: { value: 9, multiplier: 1000000000, tolerance: null, tempCoeff: null, color: "#FFFFFF" },
  gold: { value: null, multiplier: 0.1, tolerance: 5, tempCoeff: null, color: "#b59700" },
  silver: { value: null, multiplier: 0.01, tolerance: 10, tempCoeff: null, color: "#C0C0C0" },
};

type ColorName = keyof typeof RESISTOR_COLORS;

export default function Index() {
  const { colors, theme, setTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const [bandCount, setBandCount] = useState<3 | 4 | 5 | 6>(4);
  const [modalSettingsVisible, setModalSettingsVisible] = useState(false);
  const [modalPrivacyVisible, setModalPrivacyVisible] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorName[]>([
    "brown",
    "black",
    "red",
    "gold",
    "brown",
    "brown",
  ]);

  useFocusEffect(
    React.useCallback(() => {

      const loadDetectedColors = async () => {
        try {
          const savedColors = await AsyncStorage.getItem('detectedColors');
          const savedBandCount = await AsyncStorage.getItem('bandCount');

          if (savedColors) {
            const colors: ColorName[] = JSON.parse(savedColors);

            setSelectedColors(colors);

            if (savedBandCount) {
              setBandCount(Number(savedBandCount) as 3 | 4 | 5 | 6);
            }

            await AsyncStorage.removeItem('detectedColors');
            await AsyncStorage.removeItem('bandCount');
          }
        } catch (error) {

        }
      };

      loadDetectedColors();
    }, [])
  );

  const handleBandCountChange = (count: 3 | 4 | 5 | 6) => {
    setBandCount(count);
    // Reset colors when band count changes
    const defaultColors: ColorName[] = ["brown", "black", "red", "gold", "brown", "brown"];
    setSelectedColors(defaultColors);
  };

  const handleColorSelect = (bandIndex: number, color: ColorName) => {
    const newColors = [...selectedColors];
    newColors[bandIndex] = color;
    setSelectedColors(newColors);
  };

  const calculateResistance = () => {
    let resistance: number;
    let tolerance: number | null;
    let tempCoeff: number | null = null;

    if (bandCount === 3) {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[2]].multiplier ?? 1;
      resistance = (digit1 * 10 + digit2) * multiplier;
      tolerance = null;
    } else if (bandCount === 4) {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[2]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[selectedColors[3]].tolerance ?? null;
      resistance = (digit1 * 10 + digit2) * multiplier;
    } else if (bandCount === 5) {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const digit3 = RESISTOR_COLORS[selectedColors[2]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[3]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[selectedColors[4]].tolerance ?? null;
      resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    } else {
      const digit1 = RESISTOR_COLORS[selectedColors[0]].value ?? 0;
      const digit2 = RESISTOR_COLORS[selectedColors[1]].value ?? 0;
      const digit3 = RESISTOR_COLORS[selectedColors[2]].value ?? 0;
      const multiplier = RESISTOR_COLORS[selectedColors[3]].multiplier ?? 1;
      tolerance = RESISTOR_COLORS[selectedColors[4]].tolerance ?? null;
      tempCoeff = RESISTOR_COLORS[selectedColors[5]].tempCoeff ?? null;
      resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    }


    return { value: resistance, tolerance, tempCoeff };
  };

  const { value, tolerance, tempCoeff } = calculateResistance();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingTop: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '80%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.cardBackground,
      borderWidth: 2,
      borderColor: colors.border,
    },
    themeOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    themeIcon: {
      marginRight: 12,
    },
    themeOptionText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    privacyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 8,
      marginBottom: 8,
    },
    privacyButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    privacyModalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      width: '85%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    privacyScrollContent: {
      padding: 24,
      paddingBottom: 80,
    },
    privacyModalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    privacyIntro: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
    privacySectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    privacySectionText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    privacyCompany: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 16,
      fontWeight: '600',
    },
    closeButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    privacyCloseButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      marginHorizontal: 24,
      marginBottom: 20,
      alignItems: 'center',
      borderRadius: 12,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const getThemeIcon = (themeType: 'light' | 'dark' | 'auto') => {
    switch (themeType) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'auto':
        return 'phone-portrait';
      default:
        return 'sunny';
    }
  };

  const getThemeLabel = (themeType: 'light' | 'dark' | 'auto') => {
    switch (themeType) {
      case 'light':
        return t('settings.themeLight');
      case 'dark':
        return t('settings.themeDark');
      case 'auto':
        return t('settings.themeAuto');
      default:
        return t('settings.themeLight');
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} animated={true} />
      {/* Settings */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSettingsVisible}
        onRequestClose={() => setModalSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalSettingsVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('settings.title')}</Text>

              {/* Mode */}
              <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'light' && styles.themeOptionSelected,
                ]}
                onPress={() => setTheme('light')}
              >
                <Ionicons
                  name={getThemeIcon('light')}
                  size={24}
                  color={theme === 'light' ? colors.primary : colors.text}
                  style={styles.themeIcon}
                />
                <Text style={styles.themeOptionText}>
                  {getThemeLabel('light')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'dark' && styles.themeOptionSelected,
                ]}
                onPress={() => setTheme('dark')}
              >
                <Ionicons
                  name={getThemeIcon('dark')}
                  size={24}
                  color={theme === 'dark' ? colors.primary : colors.text}
                  style={styles.themeIcon}
                />
                <Text style={styles.themeOptionText}>
                  {getThemeLabel('dark')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'auto' && styles.themeOptionSelected,
                ]}
                onPress={() => setTheme('auto')}
              >
                <Ionicons
                  name={getThemeIcon('auto')}
                  size={24}
                  color={theme === 'auto' ? colors.primary : colors.text}
                  style={styles.themeIcon}
                />
                <Text style={styles.themeOptionText}>
                  {getThemeLabel('auto')}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.sectionDivider} />


              {/* Privacy Policy */}
              <TouchableOpacity
                style={styles.privacyButton}
                onPress={() => {
                  setModalSettingsVisible(false);
                  setModalPrivacyVisible(true);
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={styles.privacyButtonText}>{t('settings.privacyPolicy')}</Text>
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalSettingsVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalPrivacyVisible}
        onRequestClose={() => setModalPrivacyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.privacyModalContent}>
            <ScrollView
              contentContainerStyle={styles.privacyScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.privacyModalTitle}>{t('privacy.title')}</Text>

              <Text style={styles.privacyIntro}>
                {t('privacy.intro')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section1Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section1Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section2Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section2Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section3Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section3Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section4Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section4Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section5Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section5Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section6Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section6Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section7Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section7Text')}
              </Text>

              <Text style={styles.privacySectionTitle}>{t('privacy.section8Title')}</Text>
              <Text style={styles.privacySectionText}>
                {t('privacy.section8Text')}
              </Text>

              <Text style={styles.privacyCompany}>{t('privacy.company')}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.privacyCloseButton}
              onPress={() => setModalPrivacyVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>Resistor Vision</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setModalSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ResistanceResult value={value} tolerance={tolerance} tempCoeff={tempCoeff} />
        <ResistorDisplay colors={selectedColors} bandCount={bandCount} />
        <BandCountSelector bandCount={bandCount} onBandCountChange={handleBandCountChange} />
        <ColorSelector
          bandCount={bandCount}
          selectedColors={selectedColors}
          onColorSelect={handleColorSelect}
        />
      </ScrollView>
    </View>
  );
}

