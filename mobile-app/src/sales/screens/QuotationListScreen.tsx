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

type QuotationListNavigationProp = NativeStackNavigationProp<SalesStackParamList, 'QuotationList'>;

const QuotationListScreen: React.FC = () => {
  const navigation = useNavigation<QuotationListNavigationProp>();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations');
      setQuotations(response.data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
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
      submitted: '제출됨',
      approved: '승인됨',
      rejected: '거절됨',
      expired: '만료됨',
    };
    return statusMap[status] || status;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>견적 관리</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('QuotationDetail', {})}
        >
          <Text style={styles.addButtonText}>+ 등록</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={quotations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('QuotationDetail', { id: item.id })}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.quotation_number}</Text>
              <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <Text style={styles.itemAmount}>
              총액: {item.total_amount?.toLocaleString()}원
            </Text>
            <Text style={styles.itemDate}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR') : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>견적 내역이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    draft: '#95a5a6',
    submitted: '#3498db',
    approved: '#27ae60',
    rejected: '#e74c3c',
    expired: '#7f8c8d',
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

export default QuotationListScreen;
