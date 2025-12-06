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
  Picker,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SalesStackParamList } from '../App';
import api from '../../services/api';

type ConsultationDetailNavigationProp = NativeStackNavigationProp<SalesStackParamList, 'ConsultationDetail'>;

const ConsultationDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<ConsultationDetailNavigationProp>();
  const { id } = route.params as { id?: number };
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    consultation_date: new Date().toISOString().slice(0, 16),
    content: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
    if (id) {
      fetchConsultation();
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

  const fetchConsultation = async () => {
    try {
      const response = await api.get(`/consultations/${id}`);
      const data = response.data;
      setFormData({
        client_id: data.client_id.toString(),
        consultation_date: new Date(data.consultation_date).toISOString().slice(0, 16),
        content: data.content || '',
        notes: data.notes || '',
      });
    } catch (error) {
      Alert.alert('오류', '상담 정보를 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.content) {
      Alert.alert('오류', '필수 항목을 입력하세요.');
      return;
    }

    try {
      const submitData = {
        client_id: Number(formData.client_id),
        consultation_date: new Date(formData.consultation_date).toISOString(),
        content: formData.content,
        notes: formData.notes,
      };

      if (isNew) {
        await api.post('/consultations', submitData);
      } else {
        await api.put(`/consultations/${id}`, submitData);
      }
      Alert.alert('성공', '저장되었습니다.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.response?.data?.detail || '저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/consultations/${id}`);
            Alert.alert('성공', '삭제되었습니다.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error: any) {
            Alert.alert('오류', error.response?.data?.detail || '삭제에 실패했습니다.');
          }
        },
      },
    ]);
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
        <Text style={styles.headerTitle}>{isNew ? '상담 등록' : '상담 수정'}</Text>
        {!isNew && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteButton}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>거래처 *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              style={styles.picker}
            >
              <Picker.Item label="선택하세요" value="" />
              {clients.map((client) => (
                <Picker.Item key={client.id} label={client.name} value={client.id.toString()} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>상담일 *</Text>
          <TextInput
            style={styles.input}
            value={formData.consultation_date}
            onChangeText={(text) => setFormData({ ...formData, consultation_date: text })}
            placeholder="YYYY-MM-DDTHH:mm"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>상담 내용 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={6}
            placeholder="상담 내용을 입력하세요"
          />
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
  deleteButton: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
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
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  picker: {
    height: 50,
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

export default ConsultationDetailScreen;
