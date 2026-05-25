import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { useThemedStyles } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

const CARD_WIDTH = Math.round(width * 0.7);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.15);

const SLIDES = [
  {
    image: require('../../assets/images/welcome1.jpg'),
    caption: 'Old Montréal',
    title: 'Your circle,\nyour city',
    subtitle: 'Discover what’s happening right around you.',
  },
  {
    image: require('../../assets/images/welcome2.jpg'),
    caption: 'Saturday vibes',
    title: 'Meet people\nnearby',
    subtitle: 'Connect with neighbours who share your vibe.',
  },
  {
    image: require('../../assets/images/welcome3.jpg'),
    caption: 'Live moments',
    title: 'Local moments,\nshared live',
    subtitle: 'See posts, events and places as they happen.',
  },
];

const STACK_OFFSETS = [
  { rotate: '0deg', tx: 0, ty: 0, scale: 1 },
  { rotate: '-7deg', tx: -22, ty: -10, scale: 0.94 },
  { rotate: '7deg', tx: 22, ty: -22, scale: 0.88 },
];

const WelcomeScreen = ({ navigation }) => {
  const styles = useThemedStyles(makeStyles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const positions = useRef(SLIDES.map((_, i) => new Animated.Value(i))).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    positions.forEach((anim, j) => {
      const offset = (j - currentIndex + SLIDES.length) % SLIDES.length;
      Animated.spring(anim, {
        toValue: offset,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    });

    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, positions, fade]);

  const advance = () => setCurrentIndex(prev => (prev + 1) % SLIDES.length);

  const active = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.brandRow}>
          <View style={styles.brandCircle} />
          <Text style={styles.brandText}>Circl</Text>
        </View>

        <Pressable style={styles.deckWrap} onPress={advance}>
          <View style={styles.deck}>
            {SLIDES.map((slide, j) => {
              const pos = positions[j];
              const rotate = pos.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  STACK_OFFSETS[0].rotate,
                  STACK_OFFSETS[1].rotate,
                  STACK_OFFSETS[2].rotate,
                ],
              });
              const translateX = pos.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  STACK_OFFSETS[0].tx,
                  STACK_OFFSETS[1].tx,
                  STACK_OFFSETS[2].tx,
                ],
              });
              const translateY = pos.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  STACK_OFFSETS[0].ty,
                  STACK_OFFSETS[1].ty,
                  STACK_OFFSETS[2].ty,
                ],
              });
              const scale = pos.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  STACK_OFFSETS[0].scale,
                  STACK_OFFSETS[1].scale,
                  STACK_OFFSETS[2].scale,
                ],
              });
              const currentOffset =
                (j - currentIndex + SLIDES.length) % SLIDES.length;
              const zIndex = SLIDES.length - currentOffset;

              return (
                <Animated.View
                  key={j}
                  style={[
                    styles.card,
                    {
                      zIndex,
                      elevation: zIndex,
                      transform: [
                        { translateX },
                        { translateY },
                        { rotate },
                        { scale },
                      ],
                    },
                  ]}
                >
                  <Image source={slide.image} style={styles.cardImage} />
                  <View style={styles.cardCaption}>
                    <Text style={styles.cardCaptionText}>{slide.caption}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Pressable>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.captionWrap}>
          <Animated.Text style={[styles.title, { opacity: fade }]}>
            {active.title}
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: fade }]}>
            {active.subtitle}
          </Animated.Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Get started"
            onPress={() => navigation.navigate('Signup')}
          />
          <View style={{ height: spacing.md }} />
          <Button
            label="Log in"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
    },
    safe: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    brandCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 4,
      borderColor: colors.primary,
      marginRight: spacing.sm,
    },
    brandText: {
      fontSize: 30,
      fontWeight: typography.weight.bold,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    deckWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deck: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      position: 'absolute',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: colors.card,
      borderRadius: 6,
      padding: 12,
      paddingBottom: 40,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
    },
    cardImage: {
      flex: 1,
      width: '100%',
      backgroundColor: colors.primaryLight,
    },
    cardCaption: {
      position: 'absolute',
      bottom: 8,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    cardCaptionText: {
      fontSize: typography.size.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    dotActive: {
      width: 22,
      backgroundColor: colors.primary,
    },
    captionWrap: {
      marginTop: spacing.xl,
    },
    title: {
      fontSize: 32,
      fontWeight: typography.weight.bold,
      color: colors.textPrimary,
      lineHeight: 38,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.size.md,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    actions: {
      marginTop: spacing.xl,
    },
  });

export default WelcomeScreen;
