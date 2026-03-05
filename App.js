import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableWithoutFeedback, Text, Animated, Dimensions } from 'react-native';

// Balloon images (place in /assets)
const balloons = [
  require('./assets/red-balloon.png'),
  require('./assets/blue-balloon.png'),
  require('./assets/green-balloon.png'),
  require('./assets/yellow-balloon.png'),
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);

  // Initialize animated balloons
  const initialBalloons = balloons.map(() => ({
    y: new Animated.Value(SCREEN_HEIGHT + Math.random() * 200),
    x: Math.random() * (SCREEN_WIDTH - 100),
    speed: 1 + Math.random() * 2,
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1),
  }));

  const [balloonState, setBalloonState] = useState(initialBalloons);

  // Floating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBalloonState((prev) =>
        prev.map((b) => {
          b.y.setValue(b.y._value - b.speed);
          if (b.y._value < -150) {
            b.y.setValue(SCREEN_HEIGHT + Math.random() * 100);
            b.x = Math.random() * (SCREEN_WIDTH - 100);
          }
          return b;
        })
      );
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Tap handler
  const handleTap = (index) => {
    const b = balloonState[index];

    // Pop animation
    Animated.parallel([
      Animated.timing(b.scale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(b.opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      b.y.setValue(SCREEN_HEIGHT + Math.random() * 100);
      b.x = Math.random() * (SCREEN_WIDTH - 100);
      b.scale.setValue(1);
      b.opacity.setValue(1);
    });

    setScore((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      {balloonState.map((b, index) => (
        <TouchableWithoutFeedback key={index} onPress={() => handleTap(index)}>
          <Animated.Image
            source={balloons[index]}
            style={[
              styles.balloon,
              {
                transform: [{ translateX: b.x }, { translateY: b.y }, { scale: b.scale }],
                opacity: b.opacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      ))}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FE',
  },
  balloon: {
    width: 100,
    height: 150,
    position: 'absolute',
  },
  score: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});