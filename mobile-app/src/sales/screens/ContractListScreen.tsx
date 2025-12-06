import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SalesStackParamList } from '../App';
import api from '../../services/api';

type ContractListNavigationProp = NativeStackNavigationProp<SalesStackParamList, 'ContractList'>;

const ContractListScreen: React.FC = () => {
  const navigation = useNavigation<ContractListNavigationProp>();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: '작성중',
      signed: '계약완료',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statusMap[status] || status;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>계약 관리</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ContractDetail', {})}
        >
          <Text style={styles.addButtonText}>+ 등록</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contracts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ContractDetail', { id: item.id })}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.contract_number}</Text>
              <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <Text style={styles.itemAmount}>
              총액: {item.total_amount?.toLocaleString()}원
            </Text>
            <Text style={styles.itemDate}>
              계약일: {item.contract_date ? new Date(item.contract_date).toLocaleDateString('ko-KR') : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>계약 내역이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    draft: '#95a5a6',
    signed: '#3498db',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  itemAmount: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 12,
    color: '#7f8c8d',
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

export default ContractListScreen;
