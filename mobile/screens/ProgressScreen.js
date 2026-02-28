import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { getExerciseProgress } from '../api/api';

export default function ProgressScreen({ route, navigation }) {
  const { studentId, exerciseId, exerciseName } = route.params;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getExerciseProgress(studentId, exerciseId)
      .then(({ data }) => setEntries(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError('No se pudo cargar el historial.\nVerifica tu conexi\u00f3n.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Group entries by workout session date
  const grouped = entries.reduce((acc, entry) => {
    const dateKey = entry.workout_log?.date?.split('T')[0] || '?';
    if (!acc[dateKey]) acc[dateKey] = { date: dateKey, completed: entry.workout_log?.completed, sets: [] };
    acc[dateKey].sets.push(entry);
    return acc;
  }, {});
  const sessions = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));

  // Best set overall
  const bestWeight = entries.reduce((max, e) => Math.max(max, parseFloat(e.weight_kg) || 0), 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Volver</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={2}>{exerciseName}</Text>
          </View>
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: '#e74c3c', textAlign: 'center', fontSize: 15 }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={2}>{exerciseName}</Text>
          <Text style={styles.headerSub}>Historial de progreso</Text>
        </View>
      </View>

      {/* Summary */}
      {entries.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{sessions.length}</Text>
            <Text style={styles.summaryLabel}>sesiones</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{entries.length}</Text>
            <Text style={styles.summaryLabel}>sets totales</Text>
          </View>
          {bestWeight > 0 && (
            <View style={[styles.summaryCard, styles.summaryCardBest]}>
              <Text style={[styles.summaryValue, styles.summaryValueBest]}>{bestWeight} kg</Text>
              <Text style={styles.summaryLabel}>mejor peso</Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Sin datos de progreso aún.</Text>
            <Text style={styles.emptySub}>Registra tus sets durante los entrenamientos.</Text>
          </View>
        }
        renderItem={({ item: session }) => (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionDate}>
                {new Date(session.date).toLocaleDateString('es-CL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.sessionBadge, session.completed && styles.sessionBadgeDone]}>
                {session.completed ? '✓' : '⏸'}
              </Text>
            </View>
            {/* Sets table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>Set</Text>
                <Text style={styles.tableHeaderCell}>Kg</Text>
                <Text style={styles.tableHeaderCell}>Reps</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>Volumen</Text>
              </View>
              {session.sets.map((s) => {
                const vol =
                  s.weight_kg && s.reps_completed
                    ? (parseFloat(s.weight_kg) * s.reps_completed).toFixed(1)
                    : null;
                const isMax = parseFloat(s.weight_kg) === bestWeight && bestWeight > 0;
                return (
                  <View key={s.id} style={[styles.tableRow, isMax && styles.tableRowBest]}>
                    <Text style={[styles.tableCell, { flex: 0.7, fontWeight: '700' }]}>
                      {s.set_number}
                    </Text>
                    <Text style={[styles.tableCell, isMax && styles.tableCellBest]}>
                      {s.weight_kg ?? '—'}
                    </Text>
                    <Text style={styles.tableCell}>{s.reps_completed ?? '—'}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8, color: '#7f8c8d', fontSize: 12 }]}>
                      {vol ? `${vol} kg` : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  backBtn: { paddingTop: 2 },
  backBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 18 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  summaryCardBest: { backgroundColor: '#eafaf1' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  summaryValueBest: { color: '#27ae60' },
  summaryLabel: { fontSize: 11, color: '#7f8c8d', marginTop: 2 },

  content: { padding: 16, paddingBottom: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
  emptySub: { color: '#7f8c8d', textAlign: 'center', fontSize: 13 },

  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f2f5',
  },
  sessionDate: { fontSize: 13, fontWeight: '600', color: '#2c3e50', textTransform: 'capitalize' },
  sessionBadge: { fontSize: 16, color: '#f39c12' },
  sessionBadgeDone: { color: '#27ae60' },

  table: {},
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  tableHeaderCell: { flex: 1, fontSize: 11, fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderColor: '#f8f9fa',
  },
  tableRowBest: { backgroundColor: '#f0faf4' },
  tableCell: { flex: 1, fontSize: 14, color: '#2c3e50' },
  tableCellBest: { color: '#27ae60', fontWeight: '700' },
});
