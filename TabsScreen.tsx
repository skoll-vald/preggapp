import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import PushCountScreen from './PushCountScreen';
import ContractionsScreen from './ContractionsScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({name, color, size}) => {
  return <Icon name={name} color={color} size={size} />;
};

const TabsScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName;

          if (route.name === 'Push Count') {
            iconName = 'bar-chart'; // Replace with the name of the FontAwesome icon for Push Count
          } else if (route.name === 'Contractions') {
            iconName = 'heartbeat'; // Replace with the name of the FontAwesome icon for Contractions
          }

          return <TabBarIcon name={iconName} color={color} size={size} />;
        },
      })}
      screenOptions={{
        headerShown: false,
        activeTintColor: 'green', // Customize the active tab color
        inactiveTintColor: 'red', // Customize the inactive tab color
      }}>
      <Tab.Screen name="Push Count" component={PushCountScreen} />
      <Tab.Screen name="Contractions" component={ContractionsScreen} />
    </Tab.Navigator>
  );
};

export default TabsScreen;
