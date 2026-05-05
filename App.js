import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';

// --- Timer presets in minutes ---
const PRESETS = [5, 15, 25, 45];

// --- Sound options ---
const SOUND_MODES = ['Lofi', 'Rain', 'Brown Noise', 'Silence'];

// Local audio files (expected location: assets/audio/...)
const SOUND_FILES = {
  Lofi: require('./assets/audio/lofi.mp3'),
  Rain: require('./assets/audio/rain.mp3'),
  'Brown Noise': require('./assets/audio/brown-noise.mp3'),
};

export default function App() {
  // Task state
  const [taskInput, setTaskInput] = useState('');
  const [currentTask, setCurrentTask] = useState('');

  // Timer state
  const [selectedPreset, setSelectedPreset] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Refocus message state
  const [refocusMessage, setRefocusMessage] = useState('');

  // Daily progress state
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);

  // Audio state
  const [soundMode, setSoundMode] = useState('Silence');
  const [audioNotice, setAudioNotice] = useState('');
  const soundRef = useRef(null);

  // Keep track of interval id
  const timerRef = useRef(null);

  // Format seconds as MM:SS for display
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  // Setup audio mode once
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        setAudioNotice('Audio setup failed. The app will continue without sound.');
      }
    };

    configureAudio();

    // Cleanup on unmount
    return () => {
      stopAndUnloadSound();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    // Stop any existing interval first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    // If timer finished, end session
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionComplete(true);
      setSessionsCompletedToday((prev) => prev + 1);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const saveTask = () => {
    if (!taskInput.trim()) return;
    setCurrentTask(taskInput.trim());
    setRefocusMessage('');
  };

  const pickPreset = (minutes) => {
    setSelectedPreset(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    setSessionComplete(false);
    setRefocusMessage('');
  };

  const startTimer = () => {
    // Prevent start if no active task
    if (!currentTask) {
      setRefocusMessage('Set one focus task first, then start your session.');
      return;
    }
    setSessionComplete(false);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedPreset * 60);
    setSessionComplete(false);
    setRefocusMessage('');
  };

  const handleDistracted = () => {
    if (!currentTask) {
      setRefocusMessage('No problem. Pick a task first, then we can refocus together.');
      return;
    }
    setRefocusMessage(`No problem. Return to: ${currentTask}`);
  };

  const stopAndUnloadSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      // Ignore unload errors to keep UX smooth
    }
  };

  const changeSoundMode = async (mode) => {
    setSoundMode(mode);
    setAudioNotice('');

    // Stop anything currently playing
    await stopAndUnloadSound();

    if (mode === 'Silence') return;

    try {
      const source = SOUND_FILES[mode];
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        isLooping: true,
        volume: 0.55,
      });
      soundRef.current = sound;
    } catch (error) {
      setAudioNotice(
        'Sound file missing or not playable. Place files in assets/audio/: lofi.mp3, rain.mp3, brown-noise.mp3'
      );
    }
  };

  const handleDone = () => {
    setCurrentTask('');
    setTaskInput('');
    setSessionComplete(false);
    resetTimer();
  };

  const handleContinue = () => {
    setSessionComplete(false);
    setTimeLeft(selectedPreset * 60);
    setIsRunning(true);
  };

  const handleSwitchTask = () => {
    setCurrentTask('');
    setTaskInput('');
    setSessionComplete(false);
    setIsRunning(false);
    setTimeLeft(selectedPreset * 60);
    setRefocusMessage('Enter a new task when you are ready.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Focus Loop</Text>
        <Text style={styles.subtitle}>One task. One timer. Gentle reset.</Text>

        {/* Focus task input */}
        <View style={styles.card}>
          <Text style={styles.label}>What are you focusing on?</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Finish chapter 2 notes"
            placeholderTextColor="#8d95b3"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={saveTask}>
            <Text style={styles.primaryButtonText}>Save Focus Task</Text>
          </TouchableOpacity>

          <Text style={styles.currentTaskText}>
            Right now: {currentTask ? currentTask : 'No task selected yet'}
          </Text>
        </View>

        {/* Timer section */}
        <View style={styles.card}>
          <Text style={styles.label}>Choose timer</Text>
          <View style={styles.rowWrap}>
            {PRESETS.map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.chip,
                  selectedPreset === mins ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => pickPreset(mins)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedPreset === mins ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {mins} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.timerText}>{formattedTime}</Text>

          <View style={styles.rowWrap}>
            <TouchableOpacity style={styles.actionButton} onPress={startTimer}>
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pauseTimer}>
              <Text style={styles.actionButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={resetTimer}>
              <Text style={styles.actionButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Refocus button */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleDistracted}>
            <Text style={styles.secondaryButtonText}>I got distracted</Text>
          </TouchableOpacity>

          {refocusMessage ? <Text style={styles.refocusText}>{refocusMessage}</Text> : null}
        </View>

        {/* Sound modes */}
        <View style={styles.card}>
          <Text style={styles.label}>Focus sounds</Text>
          <View style={styles.rowWrap}>
            {SOUND_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.chip,
                  soundMode === mode ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => changeSoundMode(mode)}
              >
                <Text
                  style={[
                    styles.chipText,
                    soundMode === mode ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {audioNotice ? <Text style={styles.audioNotice}>{audioNotice}</Text> : null}
        </View>

        {/* Completion block */}
        {sessionComplete ? (
          <View style={[styles.card, styles.completeCard]}>
            <Text style={styles.completeTitle}>Focus session complete</Text>
            <Text style={styles.completeSubtitle}>Nice work. Keep your momentum gentle.</Text>

            <View style={styles.rowWrap}>
              <TouchableOpacity style={styles.actionButton} onPress={handleDone}>
                <Text style={styles.actionButtonText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleContinue}>
                <Text style={styles.actionButtonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleSwitchTask}>
                <Text style={styles.actionButtonText}>Switch Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <Text style={styles.progressText}>Sessions completed today: {sessionsCompletedToday}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f1220',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  title: {
    color: '#f6f7ff',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#b3bad6',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#171b2e',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222845',
  },
  label: {
    color: '#e5e8ff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#101427',
    color: '#f6f7ff',
    borderWidth: 1,
    borderColor: '#293058',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#6b7cff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  currentTaskText: {
    color: '#dbe1ff',
    fontSize: 17,
    lineHeight: 24,
  },
  timerText: {
    color: '#f6f7ff',
    fontSize: 52,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#6b7cff',
    borderColor: '#6b7cff',
  },
  chipInactive: {
    backgroundColor: '#0f1429',
    borderColor: '#2a3156',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#c4cae5',
  },
  actionButton: {
    backgroundColor: '#24305f',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minWidth: 84,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#eef1ff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#2a355f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#eef1ff',
    fontSize: 16,
    fontWeight: '600',
  },
  refocusText: {
    color: '#b9ffd7',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  audioNotice: {
    color: '#ffd9ad',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  completeCard: {
    borderColor: '#46615a',
    backgroundColor: '#172826',
  },
  completeTitle: {
    color: '#d6ffef',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  completeSubtitle: {
    color: '#b5e7d8',
    fontSize: 14,
    marginBottom: 10,
  },
  progressText: {
    color: '#b8c0de',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 6,
  },
});
