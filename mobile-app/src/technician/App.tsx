import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import InstallationListScreen from './screens/InstallationListScreen';
import InstallationDetailScreen from './screens/InstallationDetailScreen';
import InstallationCompleteScreen from './screens/InstallationCompleteScreen';
import ClientHistoryScreen from './screens/ClientHistoryScreen';
import MyPageScreen from './screens/MyPageScreen';

export type TechnicianStackParamList = {
  Login: undefined;
  Main: undefined;
  InstallationList: { status?: 'pending' | 'in_progress' | 'completed' };
  InstallationDetail: { id: number };
  InstallationComplete: { id: number };
  ClientHistory: { clientId: number };
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<TechnicianStackParamList>();

const TechnicianNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // 로딩 화면
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="InstallationList" component={InstallationListScreen} />
            <Stack.Screen name="InstallationDetail" component={InstallationDetailScreen} />
            <Stack.Screen name="InstallationComplete" component={InstallationCompleteScreen} />
            <Stack.Screen name="ClientHistory" component={ClientHistoryScreen} />
            <Stack.Screen name="MyPage" component={MyPageScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const TechnicianApp: React.FC = () => {
  return (
    <AuthProvider>
      <TechnicianNavigator />
    </AuthProvider>
  );
};

export default TechnicianApp;

