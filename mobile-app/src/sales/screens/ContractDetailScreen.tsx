import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SalesStackParamList } from '../App';
import api from '../../services/api';

type ContractDetailNavigationProp = NativeStackNavigationProp<SalesStackParamList, 'ContractDetail'>;

interface ContractItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

const ContractDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<ContractDetailNavigationProp>();
  const { id } = route.params as { id?: number };
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [clients, setClients] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    contract_number: '',
    client_id: '',
    status: 'draft',
    contract_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [] as ContractItem[],
  });

  useEffect(() => {
    fetchClients();
    fetchItems();
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchContract = async () => {
    try {
      const response = await api.get(`/contracts/${id}`);
      const data = response.data;
      setFormData({
        contract_number: data.contract_number || '',
        client_id: data.client_id?.toString() || '',
        status: data.status || 'draft',
        contract_date: data.contract_date || new Date().toISOString().split('T')[0],
        notes: data.notes || '',
        items: data.items || [],
      });
    } catch (error) {
      Alert.alert('오류', '계약 정보를 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: 0, quantity: 1, unit_price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof ContractItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'item_id' && value) {
      const item = items.find(i => i.id === value);
      if (item) {
        newItems[index].unit_price = item.unit_price;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unit_price));
    }, 0);
  };

  const handleSubmit = async () => {
    if (!formData.contract_number || !formData.client_id) {
      Alert.alert('오류', '필수 항목을 입력하세요.');
      return;
    }

    try {
      const submitData = {
        contract_number: formData.contract_number,
        client_id: Number(formData.client_id),
        status: formData.status,
        contract_date: formData.contract_date,
        notes: formData.notes,
        items: formData.items.map(item => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          notes: item.notes,
        })),
      };

      if (isNew) {
        await api.post('/contracts', submitData);
      } else {
        await api.put(`/contracts/${id}`, submitData);
      }
      Alert.alert('성공', '저장되었습니다.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.response?.data?.detail || '저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isNew ? '계약 등록' : '계약 수정'}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>계약번호 *</Text>
          <TextInput
            style={styles.input}
            value={formData.contract_number}
            onChangeText={(text) => setFormData({ ...formData, contract_number: text })}
            placeholder="계약번호를 입력하세요"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>거래처 *</Text>
          <TextInput
            style={styles.input}
            value={formData.client_id}
            onChangeText={(text) => setFormData({ ...formData, client_id: text })}
            placeholder="거래처 ID"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>계약일 *</Text>
          <TextInput
            style={styles.input}
            value={formData.contract_date}
            onChangeText={(text) => setFormData({ ...formData, contract_date: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>상태 *</Text>
          <TextInput
            style={styles.input}
            value={formData.status}
            onChangeText={(text) => setFormData({ ...formData, status: text })}
            placeholder="draft, signed, in_progress, completed, cancelled"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>계약 항목</Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={styles.addItemButton}>+ 추가</Text>
            </TouchableOpacity>
          </View>
          {formData.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <TextInput
                style={[styles.input, styles.itemInput]}
                value={item.item_id.toString()}
                onChangeText={(text) => updateItem(index, 'item_id', Number(text))}
                placeholder="품목 ID"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.itemInput]}
                value={item.quantity.toString()}
                onChangeText={(text) => updateItem(index, 'quantity', Number(text))}
                placeholder="수량"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.itemInput]}
                value={item.unit_price.toString()}
                onChangeText={(text) => updateItem(index, 'unit_price', Number(text))}
                placeholder="단가"
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => removeItem(index)}>
                <Text style={styles.removeItemButton}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
          {formData.items.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>총액: {calculateTotal().toLocaleString()}원</Text>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>비고</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={4}
            placeholder="비고를 입력하세요"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
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
  form: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addItemButton: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  itemInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeItemButton: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
  },
  totalContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContractDetailScreen;
