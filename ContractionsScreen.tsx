import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TapTimerScreen = () => {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [showFirstItem, setShowFirstItem] = useState(true);
  const [liveDuration, setLiveDuration] = useState<number | null>(null);
  const liveDurationRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const initialPhaseBreaks = (index: number) => {
    if (index % 2 === 0) {
      // Check if the item is a break (even index)
      const prevTapTime = tapTimes[index - 1];
      const currentTapTime = tapTimes[index];
      const breakDuration = currentTapTime - prevTapTime;
      return breakDuration <= 30 * 60 * 1000 && breakDuration >= 5 * 60 * 1000; // 30 minutes to 5 minutes in milliseconds
    }
    return false;
  };

  const activePhaseBreaks = (index: number) => {
    if (index % 2 === 0) {
      // Check if the item is a break (even index)
      const prevTapTime = tapTimes[index - 1];
      const currentTapTime = tapTimes[index];
      const breakDuration = currentTapTime - prevTapTime;
      return breakDuration <= 5 * 60 * 1000 && breakDuration >= 3 * 60 * 1000; // 5 minutes to 2 minutes in milliseconds
    }
    return false;
  };

  const transitionPhaseBreaks = (index: number) => {
    if (index % 2 === 0) {
      // Check if the item is a break (even index)
      const prevTapTime = tapTimes[index - 1];
      const currentTapTime = tapTimes[index];
      const breakDuration = currentTapTime - prevTapTime;
      return breakDuration <= 3 * 60 * 1000 && breakDuration >= 2 * 60 * 1000; // 3 minutes to 2 minutes in milliseconds
    }
    return false;
  };

  const initialPhaseContraction = (index: number) => {
    if (index % 2 === 1) {
      // Check if the item is a contraction (odd index)
      const contractionDuration = tapTimes[index] - tapTimes[index - 1];
      return (
        contractionDuration <= 40 * 1000 && contractionDuration >= 15 * 1000
      );
    }
    return false;
  };

  const activePhaseContraction = (index: number) => {
    if (index % 2 === 1) {
      // Check if the item is a contraction (odd index)
      const contractionDuration = tapTimes[index] - tapTimes[index - 1];
      return (
        contractionDuration <= 60 * 1000 && contractionDuration >= 40 * 1000
      );
    }
    return false;
  };

  const transitionPhaseContraction = (index: number) => {
    if (index % 2 === 1) {
      // Check if the item is a contraction (odd index)
      const contractionDuration = tapTimes[index] - tapTimes[index - 1];
      return contractionDuration > 60 * 1000;
    }
    return false;
  };

  const handleTap = () => {
    const currentTapTime = Date.now();
    setTapTimes([...tapTimes, currentTapTime]);

    // Save the current tap times to AsyncStorage
    AsyncStorage.setItem(
      'tapTimes',
      JSON.stringify([...tapTimes, currentTapTime]),
    );

    setShowFirstItem(false); // Hide the first item after the first tap
    setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTapTimes = await AsyncStorage.getItem('tapTimes');
        if (savedTapTimes) {
          setTapTimes(JSON.parse(savedTapTimes));
          setShowFirstItem(false); // If there are saved tap times, hide the first item
        }
      } catch (error) {
        console.log('Error loading data from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (tapTimes.length > 0) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const lastTapTime = tapTimes[tapTimes.length - 1];
        const duration = currentTime - lastTapTime;

        setLiveDuration(duration);
        liveDurationRef.current = duration;
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tapTimes]);

  const calculateDurations = () => {
    const durations: string[] = [];

    for (let i = 1; i < tapTimes.length; i++) {
      const prevTapTime = tapTimes[i - 1];
      const currentTapTime = tapTimes[i];
      const duration = currentTapTime - prevTapTime;

      durations.push(formatDuration(duration));
    }

    return durations;
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const renderItem = ({item, index}: {item: number; index: number}) => {
    if (index === 0 && !showFirstItem) {
      // Do not render the first item after the first tap
      return null;
    }

    const isContraction = index % 2 === 1;
    const previousTapTime = tapTimes[index - 1];
    const tapTime = item;

    return (
      <View style={styles.listItem}>
        {initialPhaseBreaks(index) && (
          <Text style={styles.greenPhaseText}>Начальная фаза ≈ 7-8 часов</Text>
        )}
        {activePhaseBreaks(index) && (
          <Text style={styles.orangePhaseText}>Активная фаза ≈ 3-5 часов</Text>
        )}
        {transitionPhaseBreaks(index) && (
          // eslint-disable-next-line prettier/prettier
          <Text style={styles.redPhaseText}>Транзитная фаза ≈ 0,5-1,5 часа</Text>
        )}
        {initialPhaseContraction(index) && (
          <Text style={styles.greenPhaseText}>Начальная фаза ≈ 7-8 часов</Text>
        )}
        {activePhaseContraction(index) && (
          <Text style={styles.orangePhaseText}>Активная фаза ≈ 3-5 часов</Text>
        )}
        {transitionPhaseContraction(index) && (
          // eslint-disable-next-line prettier/prettier
          <Text style={styles.redPhaseText}>Транзитная фаза ≈ 0,5-1,5 часа</Text>
        )}
        <Text style={styles.listItemText}>
          {isContraction ? 'Схватка ' : 'Пауза '}
          {index > 0 && `длилась: ${calculateDurations()[index - 1]}`}
          {'\n'}
          {index > 0 && `Нач: ${new Date(previousTapTime).toLocaleString()}`}
          {'\n'}
          Кон: {new Date(tapTime).toLocaleString()}
          {index > 0 && '\n'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {tapTimes.length > 0 && (
        <FlatList
          data={tapTimes}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          inverted
          ref={flatListRef} // Add the ref here
        />
      )}
      {liveDuration !== null && (
        <Text style={styles.liveDurationText}>
          {tapTimes.length === 0
            ? 'Пауза'
            : tapTimes.length % 2 === 1
            ? 'Схватка'
            : 'Пауза'}
          : {formatDuration(liveDuration)}
        </Text>
      )}
      <TouchableOpacity onPress={handleTap}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>
            {tapTimes.length === 0
              ? 'Начать схватку'
              : tapTimes.length % 2 === 1
              ? 'Закончить схватку'
              : 'Начать схватку'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  greenPhaseText: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  orangePhaseText: {
    fontSize: 16,
    color: 'orange',
    fontWeight: 'bold',
  },
  redPhaseText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  buttonContainer: {
    backgroundColor: '#3343CE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  listItem: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  listItemText: {
    fontSize: 16,
  },
  liveDurationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TapTimerScreen;
