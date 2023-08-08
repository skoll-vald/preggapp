import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CalendarList} from 'react-native-calendars';

interface PushCounts {
  [hour: number]: number;
}

const PushCountScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [pushCounts, setPushCounts] = useState<PushCounts>({});
  const [pushCountsActual, setPushCountsActual] = useState<PushCounts>({});
  const [currentPushCount, setCurrentPushCount] = useState<number>(0);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const storePushCount = useCallback(
    async (date: string, hour: number, count: number) => {
      try {
        const key = `${date}-${hour}`;
        await AsyncStorage.setItem(key, count.toString());
      } catch (error) {
        console.error('Error storing push count:', error);
      }
    },
    [],
  );

  const getPushCount = useCallback(
    async (date: string, hour: number): Promise<number> => {
      try {
        const key = `${date}-${hour}`;
        const count = await AsyncStorage.getItem(key);
        return count ? parseInt(count, 10) : 0;
      } catch (error) {
        console.error('Error getting push count:', error);
        return 0;
      }
    },
    [],
  );

  const loadPushCountsForDate = useCallback(
    async (date: string) => {
      const counts: PushCounts = {};
      let totalPushes = 0;

      for (let hour = 0; hour < 24; hour++) {
        counts[hour] = await getPushCount(date, hour);
        totalPushes += counts[hour];
      }

      const countsActual: PushCounts = {}; // Create a new object for actual counts

      for (let hour = 0; hour < 24; hour++) {
        countsActual[hour] = counts[hour]; // Set the actual push count
        counts[hour] =
          totalPushes === 0 ? 0 : (counts[hour] / totalPushes) * 100; // Calculate percentage
      }

      setPushCounts(counts);
      setPushCountsActual(countsActual); // Set the actual push counts
    },
    [getPushCount],
  );

  const handleDayPress = useCallback(
    (day: {dateString: string}) => {
      setSelectedDate(day.dateString);
      loadPushCountsForDate(day.dateString);
      setShowCalendar(false); // Hide the calendar after choosing a date
    },
    [loadPushCountsForDate],
  );

  const handlePush = () => {
    const newHour = new Date().getHours();
    const newPushCount = pushCountsActual[newHour] + 1;

    // Update the push count for the current hour
    setPushCountsActual(prevCounts => ({
      ...prevCounts,
      [newHour]: newPushCount,
    }));

    // Store the updated push count in AsyncStorage
    storePushCount(selectedDate, newHour, newPushCount)
      .then(() => {
        // Reload push counts for the selected date
        loadPushCountsForDate(selectedDate);
      })
      .catch(error => {
        console.error('Error handling push:', error);
      });
  };

  const isPastDate = (date: string): boolean => {
    return new Date(date) <= new Date();
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);

    // Load the current push count from AsyncStorage for the selected hour
    const currentHour = new Date().getHours();
    getPushCount(today, currentHour).then(count => {
      setCurrentPushCount(count);
    });

    loadPushCountsForDate(today);
  }, [getPushCount, loadPushCountsForDate]);

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadPushCountsForDate(today);
  }, [loadPushCountsForDate]);

  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  return (
    <View style={styles.container}>
      {!showCalendar && (
        <View style={{flex: 1}}>
          <Text style={styles.dateText}>
            Push Percentages for {selectedDate}:
          </Text>
          <ScrollView>
            {Object.entries(pushCounts).map(([hour, percentage]) => (
              <TouchableOpacity
                key={hour}
                onPress={
                  isPastDate(selectedDate) && isToday(selectedDate)
                    ? handlePush
                    : undefined
                } // Allow push only for today's past dates
                style={styles.barContainer}>
                <Text style={styles.hourText}>
                  {hour.toString().padStart(2, '0')}:{' '}
                </Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, {width: `${percentage / 1.5}%`}]} />
                </View>
                <Text style={styles.pushText}>
                  {pushCountsActual[parseInt(hour, 10)]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title="Show Calendar" onPress={toggleCalendar} />
        </View>
      )}
      {showCalendar && (
        <CalendarList
          onDayPress={day => {
            if (isPastDate(day.dateString)) {
              handleDayPress(day);
            }
          }}
          markedDates={{
            [selectedDate]: {selected: true, selectedColor: 'blue'},
          }}
          scrollEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourText: {
    marginRight: 10,
  },
  pushText: {
    marginLeft: 10,
  },
  bar: {
    height: 10,
    backgroundColor: 'blue',
  },
  barWrapper: {
    flex: 1,
  },
});

export default PushCountScreen;
//
