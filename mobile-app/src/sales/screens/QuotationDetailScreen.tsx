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

type QuotationDetailNavigationProp = NativeStackNavigationProp<SalesStackParamList, 'QuotationDetail'>;

interface QuotationItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

const QuotationDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<QuotationDetailNavigationProp>();
  const { id } = route.params as { id?: number };
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [clients, setClients] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    quotation_number: '',
    client_id: '',
    status: 'draft',
    valid_until: '',
    notes: '',
    items: [] as QuotationItem[],
  });

  useEffect(() => {
    fetchClients();
    fetchItems();
    if (id) {
      fetchQuotation();
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

  const fetchQuotation = async () => {
    try {
      const response = await api.get(`/quotations/${id}`);
      const data = response.data;
      setFormData({
        quotation_number: data.quotation_number || '',
        client_id: data.client_id?.toString() || '',
        status: data.status || 'draft',
        valid_until: data.valid_until ? new Date(data.valid_until).toISOString().slice(0, 16) : '',
        notes: data.notes || '',
        items: data.items || [],
      });
    } catch (error) {
      Alert.alert('오류', '견적 정보를 불러올 수 없습니다.');
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

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
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
    if (!formData.quotation_number || !formData.client_id) {
      Alert.alert('오류', '필수 항목을 입력하세요.');
      return;
    }

    try {
      const submitData = {
        quotation_number: formData.quotation_number,
        client_id: Number(formData.client_id),
        status: formData.status,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        notes: formData.notes,
        items: formData.items.map(item => ({
          item_id: Number(item.item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          notes: item.notes,
        })),
      };

      if (isNew) {
        await api.post('/quotations', submitData);
      } else {
        await api.put(`/quotations/${id}`, submitData);
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
        <Text style={styles.headerTitle}>{isNew ? '견적 등록' : '견적 수정'}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>견적번호 *</Text>
          <TextInput
            style={styles.input}
            value={formData.quotation_number}
            onChangeText={(text) => setFormData({ ...formData, quotation_number: text })}
            placeholder="견적번호를 입력하세요"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>거래처 *</Text>
          <View style={styles.pickerContainer}>
            {/* Picker는 React Native에서 별도 패키지 필요 */}
            <TextInput
              style={styles.input}
              value={formData.client_id}
              onChangeText={(text) => setFormData({ ...formData, client_id: text })}
              placeholder="거래처 ID"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>상태 *</Text>
          <View style={styles.pickerContainer}>
            <TextInput
              style={styles.input}
              value={formData.status}
              onChangeText={(text) => setFormData({ ...formData, status: text })}
              placeholder="draft, submitted, approved, rejected, expired"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>유효기한</Text>
          <TextInput
            style={styles.input}
            value={formData.valid_until}
            onChangeText={(text) => setFormData({ ...formData, valid_until: text })}
            placeholder="YYYY-MM-DDTHH:mm"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>견적 항목</Text>
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
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

export default QuotationDetailScreen;
