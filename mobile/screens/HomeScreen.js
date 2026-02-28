import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getStudentAssignments, getStudentWorkouts } from '../api/api';
import { useStudent } from '../context/StudentContext';

export default function HomeScreen({ navigation }) {
  const { student, logout } = useStudent();
  const [assignments, setAssignments] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [asgResult, wkResult] = await Promise.allSettled([
        getStudentAssignments(student.id),
        getStudentWorkouts(student.id),
      ]);

      if (asgResult.status === 'fulfilled') {
        const data = asgResult.value.data;
        const active = Array.isArray(data)
          ? data.filter((a) => a.status === 'active')
          : [];
        setAssignments(active);
      } else {
        setAssignments([]);
      }

      if (wkResult.status === 'fulfilled') {
        const data = wkResult.value.data;
        setRecentWorkouts(Array.isArray(data) ? data.slice(0, 5) : []);
      } else {
        setRecentWorkouts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [student.id])
  );

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: logout, style: 'destructive' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Hola,</Text>
          <Text style={styles.headerName}>{student.name} 👋</Text>
          {student.goal ? (
            <Text style={styles.headerGoal}>Objetivo: {student.goal}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => ''}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
        ListHeaderComponent={
          <>
            {/* Active assignments */}
            <Text style={styles.sectionTitle}>🏋️ Mis Pautas Activas</Text>
            {assignments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Sin pautas asignadas activas.</Text>
                <Text style={styles.emptySubText}>Pídele a tu entrenador que te asigne una.</Text>
              </View>
            ) : (
              assignments.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.assignmentCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('Workout', {
                      assignmentId: a.id,
                      pautaId: a.routine_id,
                      pautaTitulo: a.pautas?.titulo || 'Pauta',
                      studentId: student.id,
                    })
                  }
                >
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle}>{a.pautas?.titulo}</Text>
                    <Text style={styles.assignmentMeta}>
                      {a.pautas?.mes} {a.pautas?.anio}
                    </Text>
                  </View>
                  {a.starts_at ? (
                    <Text style={styles.assignmentDate}>
                      Inicio: {new Date(a.starts_at).toLocaleDateString('es-CL')}
                    </Text>
                  ) : null}
                  <View style={styles.startBtn}>
                    <Text style={styles.startBtnText}>▶  Iniciar sesión de hoy</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Recent workouts */}
            {recentWorkouts.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📅 Últimas sesiones</Text>
                {recentWorkouts.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.workoutRow}
                    onPress={() => {
                      if (!w.assignment_id || !w.assignment?.routine_id) {
                        Alert.alert('Error', 'La pauta de esta sesi\u00f3n ya no est\u00e1 disponible.');
                        return;
                      }
                      navigation.navigate('Workout', {
                        workoutLogId: w.id,
                        assignmentId: w.assignment_id,
                        pautaId: w.assignment.routine_id,
                        pautaTitulo: w.assignment?.pautas?.titulo || 'Pauta',
                        studentId: student.id,
                        readonly: true,
                      });
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.workoutRowTitle}>
                        {w.assignment?.pautas?.titulo}
                      </Text>
                      <Text style={styles.workoutRowDate}>
                        {new Date(w.date).toLocaleDateString('es-CL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </Text>
                    </View>
                    <Text style={[styles.workoutBadge, w.completed && styles.workoutBadgeDone]}>
                      {w.completed ? '✓ Completada' : '⏸ Incompleta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  headerName: { color: 'white', fontSize: 22, fontWeight: '700', marginVertical: 2 },
  headerGoal: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  logoutText: { color: 'white', fontSize: 13 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 10 },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: { fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
  emptySubText: { color: '#7f8c8d', fontSize: 13, textAlign: 'center' },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  assignmentHeader: {
    backgroundColor: '#2c3e50',
    padding: 16,
  },
  assignmentTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  assignmentMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  assignmentDate: { color: '#7f8c8d', fontSize: 13, paddingHorizontal: 16, paddingTop: 10 },
  startBtn: {
    margin: 12,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  startBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  workoutRow: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutRowTitle: { fontWeight: '600', color: '#2c3e50', fontSize: 14 },
  workoutRowDate: { color: '#7f8c8d', fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  workoutBadge: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '600',
    backgroundColor: '#fef9e7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutBadgeDone: { color: '#27ae60', backgroundColor: '#eafaf1' },
});
