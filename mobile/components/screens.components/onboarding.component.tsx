import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  ColorValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons'
import LottieView from "lottie-react-native";
import { SLIDES } from "@/data/onboarding.slides.data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");


// Static mapping for Lottie assets — Metro requires static `require` calls
const lottieAssets: Record<string, any> = {
  "map-navigation.json": require("@/assets/lottie/map-navigation.json"),
  "money-time.json": require("@/assets/lottie/money-time.json"),
  "user-profile.json": require("@/assets/lottie/user-profile.json"),
};

const LottieAnimation: React.FC<{ lottieFile: string }> = ({ lottieFile }) => {
  const source =
    lottieAssets[lottieFile] ?? lottieAssets["map-navigation.json"];
  return (
    <LottieView
      source={source}
      autoPlay
      loop
      style={{ width: 280, height: 280 }}
    />
  );
};
// --- SLIDE ITEM COMPONENT ---
const SlideItem: React.FC<{ item: Slide; index: number }> = ({
  item,
  index,
}) => (
  <View
    className="flex-1 items-center justify-center px-8"
    style={{ width: SCREEN_WIDTH }}
  >
    {/* Lottie Animation Area */}
    <View className="flex-1 justify-center items-center pt-20">
      <LottieAnimation lottieFile={item.lottieFile} />
    </View>

    {/* Content Area */}
    <View className="pb-32 px-4">
      <Text className="text-4xl font-bold text-white mb-6 text-center leading-tight">
        {item.title}
      </Text>
      <Text className="text-base text-white/70 text-center leading-7 px-2">
        {item.description}
      </Text>
    </View>
  </View>
);

// --- PAGINATION DOTS ---
const Paginator: React.FC<{ data: Slide[]; scrollX: Animated.Value }> = ({
  data,
  scrollX,
}) => {
  return (
    <View className="flex-row justify-center items-center mb-8">
      {data.map((_, i) => {
        const inputRange = [
          (i - 1) * SCREEN_WIDTH,
          i * SCREEN_WIDTH,
          (i + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i.toString()}
            style={{
              height: 8,
              width: dotWidth,
              opacity,
            }}
            className="rounded-full bg-white mx-1"
          />
        );
      })}
    </View>
  );
};

// --- MAIN ONBOARDING COMPONENT ---
const OnboardingScreenComponent: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<Slide>>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const currentColors = SLIDES[currentIndex].colors;

  return (
    <LinearGradient
      colors={currentColors as [ColorValue, ColorValue, ...ColorValue[]]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={currentColors[0]}
        translucent
      />

      <SafeAreaView className="flex-1">
        {/* Skip Button (more visible + icon) */}
        {!isLastSlide && (
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            className="absolute top-12 right-6 z-20 flex-row items-center px-3 py-2 rounded-full bg-white/95 shadow-lg"
          >
            <Text className="text-[#0b1220] font-extrabold ml-2">Skip</Text>
            <Ionicons name="chevron-forward" size={20} color="#0b1220" />
          </TouchableOpacity>
        )}

        {/* Slides */}
        <View className="flex-1">
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={({ item, index }) => (
              <SlideItem item={item} index={index} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
          />
        </View>

        {/* Bottom Section */}
        <View className="px-8 pb-8">
          <Paginator data={SLIDES} scrollX={scrollX} />

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            className="w-full bg-white h-16 rounded-2xl items-center justify-center shadow-xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-gray-900 text-lg font-bold">
              {isLastSlide ? "Get Started" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OnboardingScreenComponent;
