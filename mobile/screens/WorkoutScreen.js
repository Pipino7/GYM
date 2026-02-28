import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  getEjercicios,
  createWorkoutLog,
  getWorkoutLog,
  getStudentWorkouts,
  logSet,
  deleteSet,
  updateWorkoutLog,
  deleteWorkoutLog,
} from '../api/api';

// Fecha local YYYY-MM-DD (evita desfase UTC)
function getLocalDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function WorkoutScreen({ route, navigation }) {
  const {
    assignmentId,
    pautaId,
    pautaTitulo,
    studentId,
    workoutLogId: existingLogId,
    readonly = false,
  } = route.params;

  const [ejercicios, setEjercicios] = useState([]);
  const [workoutLogId, setWorkoutLogId] = useState(existingLogId || null);
  // { [exerciseId]: [ { id, set_number, weight_kg, reps_completed } ] }
  const [sets, setSets] = useState({});
  // { [exerciseId]: { weight: '', reps: '' } } – current input per exercise
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const initCalled = useRef(false);
  const createdLogId = useRef(null); // track if we created a new log (for cleanup)

  useEffect(() => {
    if (!initCalled.current) {
      initCalled.current = true;
      init();
    }
  }, []);

  const init = async () => {
    try {
      // Load exercises from the pauta
      const { data: exData } = await getEjercicios(pautaId);
      setEjercicios(Array.isArray(exData) ? exData : []);

      // Initialize empty inputs for each exercise
      const initInputs = {};
      (Array.isArray(exData) ? exData : []).forEach((e) => {
        initInputs[e.id] = { weight: '', reps: '' };
      });
      setInputs(initInputs);

      if (existingLogId) {
        // Load existing log (readonly or editable)
        const { data: log } = await getWorkoutLog(existingLogId);
        setWorkoutLogId(log.id);
        setCompleted(!!log.completed);
        const grouped = {};
        (log.exercise_logs || []).forEach((el) => {
          if (!grouped[el.exercise_id]) grouped[el.exercise_id] = [];
          grouped[el.exercise_id].push(el);
        });
        setSets(grouped);
      } else {
        // Check for an existing INCOMPLETE session for today + this assignment
        const today = getLocalDate();
        try {
          const { data: allLogs } = await getStudentWorkouts(studentId);
          const todayLog = (Array.isArray(allLogs) ? allLogs : []).find(
            (w) =>
              w.assignment_id === Number(assignmentId) &&
              !w.completed &&
              w.date?.split('T')[0] === today
          );

          if (todayLog) {
            // Resume existing session instead of creating a duplicate
            setWorkoutLogId(todayLog.id);
            const grouped = {};
            (todayLog.exercise_logs || []).forEach((el) => {
              if (!grouped[el.exercise_id]) grouped[el.exercise_id] = [];
              grouped[el.exercise_id].push(el);
            });
            setSets(grouped);
          } else {
            // No existing session for today — create a new one
            const { data: log } = await createWorkoutLog({
              studentId,
              assignmentId,
              date: today,
            });
            setWorkoutLogId(log.id);
            createdLogId.current = log.id;
          }
        } catch {
          // Fallback: if the lookup fails, just create a new one
          const { data: log } = await createWorkoutLog({
            studentId,
            assignmentId,
            date: getLocalDate(),
          });
          setWorkoutLogId(log.id);
          createdLogId.current = log.id;
        }
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar la sesión. Verifica tu conexión.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Cleanup: delete empty log if user presses back without adding any sets
  const handleBack = async () => {
    const totalSetsNow = Object.values(sets).reduce((a, arr) => a + arr.length, 0);
    if (createdLogId.current && totalSetsNow === 0) {
      try {
        await deleteWorkoutLog(createdLogId.current);
      } catch { /* best effort */ }
    }
    navigation.goBack();
  };

  const handleAddSet = async (exercise) => {
    const { weight, reps } = inputs[exercise.id] || {};
    if (!reps && !weight) {
      Alert.alert('Dato requerido', 'Ingresa al menos el peso o las repeticiones.');
      return;
    }

    const existingSets = sets[exercise.id] || [];
    const setNumber = existingSets.length + 1;

    try {
      const { data: newSet } = await logSet(workoutLogId, {
        exerciseId: exercise.id,
        setNumber,
        repsCompleted: reps ? Number(reps) : null,
        weightKg: weight ? Number(weight) : null,
      });

      setSets((prev) => ({
        ...prev,
        [exercise.id]: [...(prev[exercise.id] || []), newSet],
      }));
      setInputs((prev) => ({
        ...prev,
        [exercise.id]: { weight: '', reps: '' },
      }));
    } catch {
      Alert.alert('Error', 'No se pudo guardar el set.');
    }
  };

  const handleDeleteSet = (exercise, setEntry) => {
    Alert.alert('Eliminar set', `¿Eliminar Set ${setEntry.set_number}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSet(setEntry.id);
            setSets((prev) => ({
              ...prev,
              [exercise.id]: (prev[exercise.id] || []).filter((s) => s.id !== setEntry.id),
            }));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el set.');
          }
        },
      },
    ]);
  };

  const handleComplete = async () => {
    const totalSets = Object.values(sets).reduce((acc, arr) => acc + arr.length, 0);
    if (totalSets === 0) {
      Alert.alert('Sin datos', 'Registra al menos un set antes de completar la sesión.');
      return;
    }

    Alert.alert('¿Completar sesión?', `Has registrado ${totalSets} sets en total.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: '✓ Completar',
        onPress: async () => {
          setCompleting(true);
          try {
            await updateWorkoutLog(workoutLogId, { completed: true });
            setCompleted(true);
            Alert.alert('¡Sesión completada! 💪', 'Tu entrenamiento quedó guardado.', [
              { text: 'Volver al inicio', onPress: () => navigation.navigate('Home') },
            ]);
          } catch {
            Alert.alert('Error', 'No se pudo completar la sesión.');
          } finally {
            setCompleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Preparando sesión...</Text>
      </View>
    );
  }

  const totalSets = Object.values(sets).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Volver</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={2}>{pautaTitulo}</Text>
            <Text style={styles.headerSub}>
              {completed ? '✓ Completada' : `${totalSets} sets registrados`}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {ejercicios.map((exercise, idx) => {
            const exSets = sets[exercise.id] || [];
            const inp = inputs[exercise.id] || { weight: '', reps: '' };

            return (
              <View key={exercise.id} style={styles.exerciseCard}>
                {/* Exercise title */}
                <View style={styles.exerciseTitleRow}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exercise.nombre}</Text>
                  {exSets.length > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('Progress', {
                          studentId,
                          exerciseId: exercise.id,
                          exerciseName: exercise.nombre,
                        })
                      }
                    >
                      <Text style={styles.progressLink}>📈</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {exercise.series_repeticiones ? (
                  <Text style={styles.exercisePrescription}>
                    Prescripción: {exercise.series_repeticiones}
                    {exercise.cargas_kg ? ` · ${exercise.cargas_kg}` : ''}
                  </Text>
                ) : null}
                {exercise.observaciones ? (
                  <Text style={styles.exerciseObs}>{exercise.observaciones}</Text>
                ) : null}

                {/* Logged sets */}
                {exSets.length > 0 && (
                  <View style={styles.setsTable}>
                    <View style={styles.setsTableHeader}>
                      <Text style={[styles.setsHeaderCell, { flex: 0.6 }]}>Set</Text>
                      <Text style={styles.setsHeaderCell}>Kg</Text>
                      <Text style={styles.setsHeaderCell}>Reps</Text>
                      {!readonly && !completed && (
                        <Text style={[styles.setsHeaderCell, { flex: 0.5 }]}></Text>
                      )}
                    </View>
                    {exSets.map((s) => (
                      <View key={s.id} style={styles.setRow}>
                        <Text style={[styles.setCell, { flex: 0.6, fontWeight: '700' }]}>
                          {s.set_number}
                        </Text>
                        <Text style={styles.setCell}>{s.weight_kg ?? '—'}</Text>
                        <Text style={styles.setCell}>{s.reps_completed ?? '—'}</Text>
                        {!readonly && !completed && (
                          <TouchableOpacity
                            style={[styles.setCell, { flex: 0.5 }]}
                            onPress={() => handleDeleteSet(exercise, s)}
                          >
                            <Text style={styles.deleteSetText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Input new set */}
                {!readonly && !completed && (
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Kg</Text>
                      <TextInput
                        style={styles.input}
                        value={inp.weight}
                        onChangeText={(v) =>
                          setInputs((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], weight: v } }))
                        }
                        keyboardType="decimal-pad"
                        placeholder="0"
                        returnKeyType="next"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={styles.input}
                        value={inp.reps}
                        onChangeText={(v) =>
                          setInputs((p) => ({ ...p, [exercise.id]: { ...p[exercise.id], reps: v } }))
                        }
                        keyboardType="number-pad"
                        placeholder="0"
                        returnKeyType="done"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.addSetBtn}
                      onPress={() => handleAddSet(exercise)}
                    >
                      <Text style={styles.addSetBtnText}>+ Set {exSets.length + 1}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {/* Complete button */}
          {!readonly && !completed && (
            <TouchableOpacity
              style={[styles.completeBtn, completing && styles.completeBtnDisabled]}
              onPress={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.completeBtnText}>✓ Completar sesión ({totalSets} sets)</Text>
              )}
            </TouchableOpacity>
          )}

          {completed && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedBannerText}>✓ Sesión completada</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#7f8c8d' },
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
  content: { padding: 16, paddingBottom: 40 },

  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  exerciseNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: { color: 'white', fontSize: 12, fontWeight: '700' },
  exerciseName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#2c3e50' },
  progressLink: { fontSize: 18 },
  exercisePrescription: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 36,
  },
  exerciseObs: { fontSize: 12, color: '#7f8c8d', marginBottom: 8, marginLeft: 36 },

  setsTable: { marginTop: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  setsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  setsHeaderCell: { flex: 1, fontSize: 11, fontWeight: '700', color: '#7f8c8d', textTransform: 'uppercase' },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#f0f2f5',
  },
  setCell: { flex: 1, fontSize: 14, color: '#2c3e50' },
  deleteSetText: { color: '#e74c3c', fontSize: 14, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#f0f2f5',
  },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#7f8c8d', marginBottom: 4, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    fontWeight: '600',
  },
  addSetBtn: {
    flex: 1.5,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  addSetBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },

  completeBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBtnDisabled: { opacity: 0.6 },
  completeBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  completedBanner: {
    backgroundColor: '#eafaf1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  completedBannerText: { color: '#27ae60', fontWeight: '700', fontSize: 16 },
});
