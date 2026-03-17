import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Text, Animated, Dimensions, Button, Alert, TextInput } from 'react-native';

// Balloon images by world
const worldBalloons = {
  1: [
    require('./assets/balloons/world1/red-balloon.png'),
    require('./assets/balloons/world1/blue-balloon.png'),
    require('./assets/balloons/world1/green-balloon.png'),
    require('./assets/balloons/world1/yellow-balloon.png'),
    require('./assets/balloons/world1/red-balloon.png'),
    require('./assets/balloons/world1/blue-balloon.png'),
    require('./assets/balloons/world1/green-balloon.png'),
    require('./assets/balloons/world1/yellow-balloon.png'),
  ],
  2: [
    require('./assets/balloons/world2/dog-balloon.png'),
    require('./assets/balloons/world2/cat-balloon.png'),
    require('./assets/balloons/world2/lion-balloon.png'),
    require('./assets/balloons/world2/elephant-balloon.png'),
    require('./assets/balloons/world2/dog-balloon.png'),
    require('./assets/balloons/world2/cat-balloon.png'),
    require('./assets/balloons/world2/lion-balloon.png'),
    require('./assets/balloons/world2/elephant-balloon.png'),
  ],
  3: [
    require('./assets/balloons/world3/rocket-balloon.png'),
    require('./assets/balloons/world3/planet-balloon.png'),
    require('./assets/balloons/world3/alien-balloon.png'),
    require('./assets/balloons/world3/asteroid-balloon.png'),
    require('./assets/balloons/world3/rocket-balloon.png'),
    require('./assets/balloons/world3/planet-balloon.png'),
    require('./assets/balloons/world3/alien-balloon.png'),
    require('./assets/balloons/world3/asteroid-balloon.png'),
  ],
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BALLOON_WIDTH = 100;

export default function App() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [world, setWorld] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showParentGate, setShowParentGate] = useState(false);
  const [parentGateQuestion, setParentGateQuestion] = useState(null);
  const [parentGateAnswer, setParentGateAnswer] = useState('');

  const [balloonState, setBalloonState] = useState([]);

  const initBalloons = w =>
    worldBalloons[w].map(() => ({
      y: new Animated.Value(SCREEN_HEIGHT + Math.random() * 200),
      x: Math.random() * (SCREEN_WIDTH - BALLOON_WIDTH - 20) + 10,
      speed: 3 + Math.random() * 3,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));

  useEffect(() => {
    if (gameOver || world === null) return;
    const interval = setInterval(() => {
      setBalloonState(prev =>
        prev.map(b => {
          b.y.setValue(b.y._value - b.speed);
          if (b.y._value < -400) {
            b.y.setValue(SCREEN_HEIGHT + Math.random() * 100);
            b.x = Math.random() * (SCREEN_WIDTH - BALLOON_WIDTH - 20) + 10;
          }
          return b;
        })
      );
    }, 16);
    return () => clearInterval(interval);
  }, [gameOver, world, balloonState]);

  useEffect(() => {
    if (gameOver || world === null) return;
    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setGameOver(true);
          if (score > bestScore) setBestScore(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [gameOver, world, score, bestScore]);

  const handleTap = index => {
    if (gameOver) return;
    const b = balloonState[index];

    Animated.parallel([
      Animated.timing(b.scale, { toValue: 1.5, duration: 150, useNativeDriver: true }),
      Animated.timing(b.opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      b.y.setValue(SCREEN_HEIGHT + Math.random() * 100);
      b.x = Math.random() * (SCREEN_WIDTH - BALLOON_WIDTH - 20) + 10;
      b.scale.setValue(1);
      b.opacity.setValue(1);
    });

    setScore(prev => prev + 1);
  };

  const resetGame = () => {
    setScore(0);
    setTimer(60);
    setGameOver(false);
    setBalloonState(initBalloons(world));
    setShowParentGate(false);
  };

  // Parent Gate functions
  const generateParentGate = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setParentGateQuestion({ question: `${a} + ${b} = ?`, answer: a + b });
    setParentGateAnswer('');
  };

  const unlockFullVersion = () => {
    generateParentGate();
    setShowParentGate(true);
  };

  const selectWorld = w => {
    if (w > 1 && !unlocked) {
      unlockFullVersion();
      return;
    }
    setWorld(w);
    setBalloonState(initBalloons(w));
  };

  // WORLD SELECTION SCREEN
  if (world === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select a World</Text>

        {[1, 2, 3].map(w => (
          <View key={w} style={{ marginVertical: 10 }}>
            <Button title={`World ${w}`} onPress={() => selectWorld(w)} />
          </View>
        ))}

        {showParentGate && parentGateQuestion && !unlocked && (
          <View style={{ marginTop: 20, width: '60%', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Parent Gate Verification:</Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>{parentGateQuestion.question}</Text>
            <TextInput
              style={{
                height: 40,
                width: '50%',
                borderColor: 'gray',
                borderWidth: 1,
                textAlign: 'center',
                marginBottom: 10,
                fontSize: 16,
              }}
              keyboardType="numeric"
              value={parentGateAnswer}
              onChangeText={setParentGateAnswer}
            />
            <Button
              title="Submit"
              onPress={() => {
                if (parseInt(parentGateAnswer) === parentGateQuestion.answer) {
                  setShowParentGate(false);
                  setParentGateQuestion(null);

                  // 👉 Purchase flow (FIXED)
                  Alert.alert(
                    'Unlock Full Version',
                    'Purchase to unlock Worlds 2 & 3 for $4.99?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Buy',
                        onPress: () => {
                          setUnlocked(true);
                          Alert.alert('Success', 'Full version unlocked!');
                        },
                      },
                    ]
                  );

                } else {
                  Alert.alert('Incorrect', 'Parent Gate verification failed.');
                  generateParentGate();
                }
              }}
            />
          </View>
        )}
      </View>
    );
  }

  // GAME OVER SCREEN
  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.endText}>Game Over!</Text>
        <Text style={styles.endText}>Score: {score}</Text>
        <Text style={styles.endText}>Best: {bestScore}</Text>

        <View style={{ marginVertical: 10 }}>
          <Button title="Play Again" onPress={resetGame} />
          <View style={{ height: 10 }} />
          <Button title="Home Page" onPress={() => setWorld(null)} />
        </View>
      </View>
    );
  }

  // MAIN GAME SCREEN
  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.timer}>Time: {timer}s</Text>

      {balloonState.map((b, index) => (
        <TouchableWithoutFeedback key={index} onPress={() => handleTap(index)}>
          <Animated.Image
            source={worldBalloons[world][index]}
            style={[
              styles.balloon,
              {
                transform: [
                  { translateX: b.x },
                  { translateY: b.y },
                  { scale: b.scale }
                ],
                opacity: b.opacity
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  balloon: {
    width: BALLOON_WIDTH,
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
  timer: {
    position: 'absolute',
    top: 40,
    right: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  endText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
});