import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import ConsultationListScreen from './screens/ConsultationListScreen';
import ConsultationDetailScreen from './screens/ConsultationDetailScreen';
import QuotationListScreen from './screens/QuotationListScreen';
import QuotationDetailScreen from './screens/QuotationDetailScreen';
import ContractListScreen from './screens/ContractListScreen';
import ContractDetailScreen from './screens/ContractDetailScreen';
import ClientListScreen from './screens/ClientListScreen';
import ClientDetailScreen from './screens/ClientDetailScreen';
import MyPageScreen from './screens/MyPageScreen';

export type SalesStackParamList = {
  Login: undefined;
  Main: undefined;
  ConsultationList: undefined;
  ConsultationDetail: { id?: number };
  QuotationList: undefined;
  QuotationDetail: { id?: number };
  ContractList: undefined;
  ContractDetail: { id?: number };
  ClientList: undefined;
  ClientDetail: { id?: number };
  MyPage: undefined;
};

const Stack = createNativeStackNavigator<SalesStackParamList>();

const SalesNavigator: React.FC = () => {
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
            <Stack.Screen name="ConsultationList" component={ConsultationListScreen} />
            <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
            <Stack.Screen name="QuotationList" component={QuotationListScreen} />
            <Stack.Screen name="QuotationDetail" component={QuotationDetailScreen} />
            <Stack.Screen name="ContractList" component={ContractListScreen} />
            <Stack.Screen name="ContractDetail" component={ContractDetailScreen} />
            <Stack.Screen name="ClientList" component={ClientListScreen} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
            <Stack.Screen name="MyPage" component={MyPageScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const SalesApp: React.FC = () => {
  return (
    <AuthProvider>
      <SalesNavigator />
    </AuthProvider>
  );
};

export default SalesApp;

