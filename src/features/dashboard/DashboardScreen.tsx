import { useMemo } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';
import type { Subject } from '../../types';

const SUBJECTS: Subject[] = ['math', 'ela', 'science', 'social_studies'];
const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Math',
  ela: 'ELA',
  science: 'Science',
  social_studies: 'Social Studies',
};

export function DashboardScreen() {
  const { profile, profiles } = useGameStore();

  // For teachers, show all student profiles
  const students = profile?.role === 'TEACHER'
    ? profiles.filter((p) => p.role === 'STUDENT')
    : profile?.role === 'PARENT'
    ? profiles.filter((p) => p.role === 'STUDENT')
    : [];

  if (!profile) return null;

  if (profile.role === 'STUDENT') {
    return (
      <div className="p-4 max-w-lg mx-auto animate-slide-up">
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-bark-light">The dashboard is for parents and teachers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest">
          {profile.role === 'TEACHER' ? 'Teacher' : 'Parent'} Dashboard
        </h2>
        <p className="text-sm text-bark-light mt-1">Monitor student progress at a glance</p>
      </div>

      {students.length === 0 ? (
        <div className="journal-card bg-white/90 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-bark-light">No student profiles found. Create a student profile to see analytics here.</p>
        </div>
      ) : (
        students.map((student) => (
          <StudentCard key={student.id} studentId={student.id} studentName={student.name} />
        ))
      )}
    </div>
  );
}

function StudentCard({ studentId, studentName }: { studentId: string; studentName: string }) {
  const studentProgress = storage.getProgress(studentId);
  const activityLog = storage.getActivityLog(studentId);

  const subjectAccuracy = useMemo(() => {
    const acc: Record<Subject, { correct: number; total: number }> = {
      math: { correct: 0, total: 0 },
      ela: { correct: 0, total: 0 },
      science: { correct: 0, total: 0 },
      social_studies: { correct: 0, total: 0 },
    };

    for (const sp of Object.values(studentProgress?.standardProgress ?? {})) {
      if (acc[sp.subject]) {
        acc[sp.subject].correct += sp.totalCorrect;
        acc[sp.subject].total += sp.totalAttempts;
      }
    }

    return acc;
  }, [studentProgress]);

  const standardMastery = useMemo(() => {
    const mastery: Record<string, 'green' | 'yellow' | 'red'> = {};
    for (const [id, sp] of Object.entries(studentProgress?.standardProgress ?? {})) {
      const accuracy = sp.totalAttempts > 0 ? sp.totalCorrect / sp.totalAttempts : 0;
      mastery[id] = accuracy >= 0.7 ? 'green' : accuracy >= 0.4 ? 'yellow' : 'red';
    }
    return mastery;
  }, [studentProgress]);

  const struggleAlerts = useMemo(() => {
    return Object.entries(studentProgress?.standardProgress ?? {})
      .filter(([, sp]) => sp.totalAttempts >= 10 && (sp.totalCorrect / sp.totalAttempts) < 0.5)
      .map(([id, sp]) => ({
        standardId: id,
        subject: sp.subject,
        accuracy: Math.round((sp.totalCorrect / sp.totalAttempts) * 100),
        attempts: sp.totalAttempts,
      }));
  }, [studentProgress]);

  if (!studentProgress) return null;

  return (
    <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-xl font-bold text-forest">
          {studentName[0].toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-bark">{studentName}</h3>
          <div className="flex items-center gap-3 text-xs text-bark-light">
            <span>Level {studentProgress.level}</span>
            <span>{studentProgress.totalXp} total XP</span>
            <span>{studentProgress.dailyStreak}d streak</span>
          </div>
        </div>
      </div>

      {/* Subject accuracy bars */}
      <div>
        <h4 className="text-sm font-bold text-bark mb-2">Accuracy by Subject</h4>
        <div className="space-y-2">
          {SUBJECTS.map((subject) => {
            const data = subjectAccuracy[subject];
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <div key={subject}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-bark">{SUBJECT_LABELS[subject]}</span>
                  <span className="text-bark-light">{pct}% ({data.correct}/{data.total})</span>
                </div>
                <div className="w-full bg-paper-dark rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemax={100} aria-label={`${SUBJECT_LABELS[subject]} accuracy: ${pct}%`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 70 ? 'bg-forest-light' : pct >= 40 ? 'bg-gold' : 'bg-danger'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standards mastery heatmap */}
      {Object.keys(standardMastery).length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-bark mb-2">Standards Mastery</h4>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(standardMastery).map(([id, status]) => (
              <div
                key={id}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[8px] text-white font-bold ${
                  status === 'green' ? 'bg-forest-light' :
                  status === 'yellow' ? 'bg-gold' :
                  'bg-danger'
                }`}
                title={id}
                aria-label={`${id}: ${status}`}
              >
                {id.split('.').pop()?.slice(0, 3)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Struggle alerts */}
      {struggleAlerts.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
          <h4 className="text-sm font-bold text-danger mb-1">Struggle Alerts</h4>
          <div className="space-y-1">
            {struggleAlerts.map((alert) => (
              <div key={alert.standardId} className="text-xs text-bark flex justify-between">
                <span>{SUBJECT_LABELS[alert.subject]}: {alert.standardId}</span>
                <span className="text-danger font-bold">{alert.accuracy}% ({alert.attempts} tries)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {activityLog.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-bark mb-2">Recent Activity</h4>
          <div className="space-y-1">
            {activityLog.slice(-7).reverse().map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-paper rounded-lg">
                <span className="text-bark-light">{entry.date}</span>
                <span className="text-bark">{SUBJECT_LABELS[entry.subject]}</span>
                <span className={entry.accuracy >= 70 ? 'text-forest-light' : 'text-gold'}>{entry.accuracy}%</span>
                <span className="text-gold font-bold">+{entry.xpEarned}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
