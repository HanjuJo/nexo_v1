import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TechnicianStackParamList } from '../App';
import { useAuth } from '../../contexts/AuthContext';

type MainScreenNavigationProp = NativeStackNavigationProp<TechnicianStackParamList, 'Main'>;

const MainScreen: React.FC = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const { user } = useAuth();

  const menuItems = [
    { title: '진행중 작업', screen: 'InstallationList', params: { status: 'in_progress' }, icon: '🔧' },
    { title: '완료된 작업', screen: 'InstallationList', params: { status: 'completed' }, icon: '✅' },
    { title: '대기중 작업', screen: 'InstallationList', params: { status: 'pending' }, icon: '⏳' },
    { title: '고객 이력 조회', screen: 'ClientHistory', params: { clientId: 0 }, icon: '📋' },
    { title: '마이페이지', screen: 'MyPage', params: {}, icon: '⚙️' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>작업 관리 시스템</Text>
        <Text style={styles.welcomeText}>{user?.full_name}님, 안녕하세요!</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => {
                if (item.screen === 'ClientHistory') {
                  // 고객 ID 입력 필요
                  navigation.navigate(item.screen as any, { clientId: 0 });
                } else {
                  navigation.navigate(item.screen as any, item.params as any);
                }
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
});

export default MainScreen;

