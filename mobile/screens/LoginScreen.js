import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { getStudents } from '../api/api';
import { useStudent } from '../context/StudentContext';

export default function LoginScreen() {
  const { login } = useStudent();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudents()
      .then(({ data }) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo conectar al servidor.\nVerifica que el backend esté corriendo y revisa la IP en api/api.js'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💪 Pautas de Entrenamiento</Text>
        <Text style={styles.headerSubtitle}>Selecciona tu nombre para continuar</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.status !== 'active' && styles.cardInactive]}
            onPress={() => login(item)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              {item.goal ? (
                <Text style={styles.cardGoal} numberOfLines={1}>{item.goal}</Text>
              ) : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No hay alumnos registrados aún.</Text>
            <Text style={styles.emptySubText}>Agrega alumnos desde la app web.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 32,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardInactive: { opacity: 0.5 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  cardGoal: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  chevron: { fontSize: 24, color: '#bdc3c7' },
  loadingText: { marginTop: 12, color: '#7f8c8d' },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorText: { color: '#e74c3c', textAlign: 'center', lineHeight: 22, fontSize: 15 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  emptySubText: { color: '#7f8c8d' },
});
