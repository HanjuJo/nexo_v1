import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TechnicianStackParamList } from '../App';
import api from '../../services/api';

type InstallationListNavigationProp = NativeStackNavigationProp<TechnicianStackParamList, 'InstallationList'>;

const InstallationListScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<InstallationListNavigationProp>();
  const { status } = route.params as { status?: 'pending' | 'in_progress' | 'completed' };
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallations();
  }, [status]);

  const fetchInstallations = async () => {
    try {
      const params: any = {};
      if (status) params.status = status;
      const response = await api.get('/installations', { params });
      setInstallations(response.data);
    } catch (error) {
      console.error('Failed to fetch installations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>
          {status === 'in_progress' ? '진행중 작업' :
           status === 'completed' ? '완료된 작업' :
           status === 'pending' ? '대기중 작업' : '작업 목록'}
        </Text>
      </View>

      <FlatList
        data={installations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('InstallationDetail', { id: item.id })}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>
                {getTypeText(item.installation_type)} - {item.client?.name || '고객 정보 없음'}
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
            {item.address && (
              <Text style={styles.itemAddress} numberOfLines={1}>
                {item.address}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>작업 내역이 없습니다.</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchInstallations}
      />
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
  itemAddress: {
    fontSize: 12,
    color: '#34495e',
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

export default InstallationListScreen;

