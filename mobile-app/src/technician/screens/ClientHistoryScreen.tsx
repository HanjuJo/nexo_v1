import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TechnicianStackParamList } from '../App';
import api from '../../services/api';

type ClientHistoryNavigationProp = NativeStackNavigationProp<TechnicianStackParamList, 'ClientHistory'>;

const ClientHistoryScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<ClientHistoryNavigationProp>();
  const { clientId: initialClientId } = route.params;
  const [clientId, setClientId] = useState(initialClientId?.toString() || '');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);

  const fetchHistory = async () => {
    if (!clientId) {
      Alert.alert('오류', '고객 ID를 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      const [historyResponse, clientResponse] = await Promise.all([
        api.get(`/installations/client/${clientId}/history`),
        api.get(`/clients/${clientId}`).catch(() => null),
      ]);
      
      setHistory(historyResponse.data);
      if (clientResponse) {
        setClientInfo(clientResponse.data);
      }
    } catch (error: any) {
      Alert.alert('오류', error.response?.data?.detail || '이력을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '대기중',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statusMap[status] || status;
  };

  const getTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      installation: '설치',
      as: 'AS',
    };
    return typeMap[type] || type;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>고객 이력 조회</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="고객 ID 입력"
          value={clientId}
          onChangeText={setClientId}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchHistory}>
          <Text style={styles.searchButtonText}>조회</Text>
        </TouchableOpacity>
      </View>

      {clientInfo && (
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{clientInfo.name}</Text>
          {clientInfo.phone && (
            <Text style={styles.clientPhone}>{clientInfo.phone}</Text>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('InstallationDetail', { id: item.id })}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {getTypeText(item.installation_type)}
                </Text>
                <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              {item.scheduled_date && (
                <Text style={styles.itemDate}>
                  예정일: {new Date(item.scheduled_date).toLocaleDateString('ko-KR')}
                </Text>
              )}
              {item.completed_date && (
                <Text style={styles.itemDate}>
                  완료일: {new Date(item.completed_date).toLocaleDateString('ko-KR')}
                </Text>
              )}
              {item.result_text && (
                <Text style={styles.itemResult} numberOfLines={2}>
                  {item.result_text}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>이력이 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    pending: '#95a5a6',
    in_progress: '#f39c12',
    completed: '#27ae60',
    cancelled: '#e74c3c',
  };
  return colorMap[status] || '#95a5a6';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clientInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  clientPhone: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  itemResult: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default ClientHistoryScreen;

