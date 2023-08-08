// App.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import TabsScreen from './TabsScreen';

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabsScreen />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
