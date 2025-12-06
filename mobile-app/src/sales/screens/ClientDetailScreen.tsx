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

type ClientDetailNavigationProp = NativeStackNavigationProp<SalesStackParamList, 'ClientDetail'>;

const ClientDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<ClientDetailNavigationProp>();
  const { id } = route.params as { id?: number };
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'individual',
    personal_name: '',
    personal_phone: '',
    personal_email: '',
    company_name: '',
    business_number: '',
    representative_name: '',
    company_phone: '',
    company_email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await api.get(`/clients/${id}`);
      const data = response.data;
      setFormData({
        name: data.name || '',
        client_type: data.client_type || 'individual',
        personal_name: data.personal_name || '',
        personal_phone: data.personal_phone || '',
        personal_email: data.personal_email || '',
        company_name: data.company_name || '',
        business_number: data.business_number || '',
        representative_name: data.representative_name || '',
        company_phone: data.company_phone || '',
        company_email: data.company_email || '',
        address: data.address || '',
        notes: data.notes || '',
      });
    } catch (error) {
      Alert.alert('오류', '거래처 정보를 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('오류', '거래처명을 입력하세요.');
      return;
    }

    try {
      if (isNew) {
        await api.post('/clients', formData);
      } else {
        await api.put(`/clients/${id}`, formData);
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
        <Text style={styles.headerTitle}>{isNew ? '거래처 등록' : '거래처 수정'}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>거래처명 *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="거래처명을 입력하세요"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>유형 *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, formData.client_type === 'individual' && styles.radioButtonSelected]}
              onPress={() => setFormData({ ...formData, client_type: 'individual' })}
            >
              <Text style={[styles.radioText, formData.client_type === 'individual' && styles.radioTextSelected]}>
                개인
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, formData.client_type === 'company' && styles.radioButtonSelected]}
              onPress={() => setFormData({ ...formData, client_type: 'company' })}
            >
              <Text style={[styles.radioText, formData.client_type === 'company' && styles.radioTextSelected]}>
                기업
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, formData.client_type === 'institution' && styles.radioButtonSelected]}
              onPress={() => setFormData({ ...formData, client_type: 'institution' })}
            >
              <Text style={[styles.radioText, formData.client_type === 'institution' && styles.radioTextSelected]}>
                기관
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {formData.client_type === 'individual' ? (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>이름 *</Text>
              <TextInput
                style={styles.input}
                value={formData.personal_name}
                onChangeText={(text) => setFormData({ ...formData, personal_name: text })}
                placeholder="이름을 입력하세요"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                value={formData.personal_phone}
                onChangeText={(text) => setFormData({ ...formData, personal_phone: text })}
                placeholder="전화번호를 입력하세요"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                value={formData.personal_email}
                onChangeText={(text) => setFormData({ ...formData, personal_email: text })}
                placeholder="이메일을 입력하세요"
                keyboardType="email-address"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>회사명 *</Text>
              <TextInput
                style={styles.input}
                value={formData.company_name}
                onChangeText={(text) => setFormData({ ...formData, company_name: text })}
                placeholder="회사명을 입력하세요"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>사업자번호</Text>
              <TextInput
                style={styles.input}
                value={formData.business_number}
                onChangeText={(text) => setFormData({ ...formData, business_number: text })}
                placeholder="사업자번호를 입력하세요"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>대표자명</Text>
              <TextInput
                style={styles.input}
                value={formData.representative_name}
                onChangeText={(text) => setFormData({ ...formData, representative_name: text })}
                placeholder="대표자명을 입력하세요"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                value={formData.company_phone}
                onChangeText={(text) => setFormData({ ...formData, company_phone: text })}
                placeholder="전화번호를 입력하세요"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                value={formData.company_email}
                onChangeText={(text) => setFormData({ ...formData, company_email: text })}
                placeholder="이메일을 입력하세요"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>주소</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="주소를 입력하세요"
              />
            </View>
          </>
        )}

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
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  radioText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '600',
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

export default ClientDetailScreen;
