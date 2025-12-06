import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TechnicianStackParamList } from '../App';
import api from '../../services/api';

type InstallationDetailNavigationProp = NativeStackNavigationProp<TechnicianStackParamList, 'InstallationDetail'>;

const InstallationDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<InstallationDetailNavigationProp>();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [installation, setInstallation] = useState<any>(null);

  useEffect(() => {
    fetchInstallation();
  }, [id]);

  const fetchInstallation = async () => {
    try {
      const response = await api.get(`/installations/${id}`);
      setInstallation(response.data);
    } catch (error) {
      Alert.alert('오류', '작업 정보를 불러올 수 없습니다.');
      navigation.goBack();
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  if (!installation) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>작업 상세</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>작업 유형</Text>
          <Text style={styles.value}>{getTypeText(installation.installation_type)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>상태</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(installation.status) }]}>
            <Text style={styles.statusText}>{getStatusText(installation.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>고객명</Text>
          <Text style={styles.value}>{installation.client?.name || '정보 없음'}</Text>
        </View>

        {installation.scheduled_date && (
          <View style={styles.section}>
            <Text style={styles.label}>예정일</Text>
            <Text style={styles.value}>
              {new Date(installation.scheduled_date).toLocaleString('ko-KR')}
            </Text>
          </View>
        )}

        {installation.completed_date && (
          <View style={styles.section}>
            <Text style={styles.label}>완료일</Text>
            <Text style={styles.value}>
              {new Date(installation.completed_date).toLocaleString('ko-KR')}
            </Text>
          </View>
        )}

        {installation.address && (
          <View style={styles.section}>
            <Text style={styles.label}>주소</Text>
            <Text style={styles.value}>{installation.address}</Text>
          </View>
        )}

        {installation.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>비고</Text>
            <Text style={styles.value}>{installation.notes}</Text>
          </View>
        )}

        {installation.result_text && (
          <View style={styles.section}>
            <Text style={styles.label}>작업 결과</Text>
            <Text style={styles.value}>{installation.result_text}</Text>
          </View>
        )}

        {(installation.photo_url_1 || installation.photo_url_2) && (
          <View style={styles.section}>
            <Text style={styles.label}>작업 사진</Text>
            {installation.photo_url_1 && (
              <Text style={styles.photoLink}>사진 1: {installation.photo_url_1}</Text>
            )}
            {installation.photo_url_2 && (
              <Text style={styles.photoLink}>사진 2: {installation.photo_url_2}</Text>
            )}
          </View>
        )}

        {installation.status !== 'completed' && installation.status !== 'cancelled' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => navigation.navigate('InstallationComplete', { id: installation.id })}
          >
            <Text style={styles.completeButtonText}>작업 완료 처리</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  content: {
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoLink: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InstallationDetailScreen;

