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
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TechnicianStackParamList } from '../App';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

type InstallationCompleteNavigationProp = NativeStackNavigationProp<TechnicianStackParamList, 'InstallationComplete'>;

const InstallationCompleteScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<InstallationCompleteNavigationProp>();
  const { id } = route.params;
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);

  const pickImage = async (photoNumber: 1 | 2) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (photoNumber === 1) {
        setPhoto1(result.assets[0].uri);
      } else {
        setPhoto2(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!resultText.trim()) {
      Alert.alert('오류', '작업 결과를 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('result_text', resultText);
      
      if (photo1) {
        const filename = photo1.split('/').pop() || 'photo1.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photo1', {
          uri: photo1,
          name: filename,
          type,
        } as any);
      }
      
      if (photo2) {
        const filename = photo2.split('/').pop() || 'photo2.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photo2', {
          uri: photo2,
          name: filename,
          type,
        } as any);
      }

      await api.put(`/installations/${id}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('성공', '작업이 완료 처리되었습니다.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.response?.data?.detail || '완료 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>작업 완료 처리</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>작업 결과 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={resultText}
            onChangeText={setResultText}
            multiline
            numberOfLines={6}
            placeholder="작업 결과를 입력하세요"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>작업 사진 1</Text>
          {photo1 ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo1 }} style={styles.photo} />
              <TouchableOpacity onPress={() => setPhoto1(null)}>
                <Text style={styles.removePhotoButton}>삭제</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={() => pickImage(1)}>
              <Text style={styles.photoButtonText}>사진 선택</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>작업 사진 2</Text>
          {photo2 ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo2 }} style={styles.photo} />
              <TouchableOpacity onPress={() => setPhoto2(null)}>
                <Text style={styles.removePhotoButton}>삭제</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={() => pickImage(2)}>
              <Text style={styles.photoButtonText}>사진 선택</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>완료 처리</Text>
          )}
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
    height: 120,
    textAlignVertical: 'top',
  },
  photoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 10,
  },
  removePhotoButton: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InstallationCompleteScreen;

