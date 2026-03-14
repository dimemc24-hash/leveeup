import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { useTheme } from '../themes/engine/ThemeContext';
import { getStreakLabel } from '../../lib/scoring';

export function QuestionScreen() {
  const navigate = useNavigate();
  const { session, answerQuestion, nextQuestion, endSession, consecutiveFailures } = useGameStore();
  const { getNarrative } = useTheme();

  const [selected, setSelected] = useState<string | null>(null);
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [fillAnswer, setFillAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; xp: number; explanation: string } | null>(null);
  const [showMilestone, setShowMilestone] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!session) navigate('/play');
  }, [session, navigate]);

  if (!session) return null;

  const question = session.questions[session.currentQuestionIndex];
  if (!question) {
    endSession();
    navigate('/play/results');
    return null;
  }

  const streakLabel = getStreakLabel(session.streak);
  const progress = ((session.currentQuestionIndex) / session.questions.length) * 100;

  const handleSubmit = () => {
    let answer: string | string[];
    if (question.questionType === 'sequencing') {
      answer = sequenceOrder;
    } else if (question.questionType === 'fill_in') {
      answer = fillAnswer.trim();
    } else {
      if (!selected) return;
      answer = selected;
    }

    const result = answerQuestion(answer);
    setFeedback({
      correct: result.correct,
      xp: result.xp,
      explanation: question.explanation,
    });

    if (result.milestones.length > 0) {
      setTimeout(() => setShowMilestone(result.milestones[0].message), 1000);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setSequenceOrder([]);
    setFillAnswer('');
    setFeedback(null);
    setShowMilestone(null);
    setShowHint(false);

    if (!nextQuestion()) {
      navigate('/play/results');
    }
  };

  const handleQuit = () => {
    endSession();
    navigate('/');
  };

  // Sequencing: toggle item in order
  const toggleSequenceItem = (item: string) => {
    if (feedback) return;
    if (sequenceOrder.includes(item)) {
      setSequenceOrder(sequenceOrder.filter((i) => i !== item));
    } else {
      setSequenceOrder([...sequenceOrder, item]);
    }
  };

  const shouldShowFrustrationPivot = consecutiveFailures >= 3;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleQuit}
          className="text-bark-light text-lg hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label="Quit session"
        >
          ✕
        </button>
        <div
          className="flex-1 rounded-full h-4 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          role="progressbar"
          aria-valuenow={session.currentQuestionIndex + 1}
          aria-valuemax={session.questions.length}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00c896, #00e6ac)',
              boxShadow: '0 0 10px rgba(0,200,150,0.4)',
            }}
          />
        </div>
        <span className="text-xs text-bark-light font-bold">{session.currentQuestionIndex + 1}/{session.questions.length}</span>
      </div>

      {/* Streak indicator */}
      {streakLabel && (
        <div className="text-center streak-fire">
          <span
            className="inline-block text-sm font-bold font-display px-4 py-1.5 rounded-full animate-bounce-in text-white"
            style={{
              background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
              boxShadow: '0 2px 0 #cc7700, 0 0 16px rgba(255,184,0,0.3)',
            }}
          >
            {streakLabel}
          </span>
        </div>
      )}

      {/* Question card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(0,200,150,0.18)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
            question.tier === 'introductory' ? 'text-green-300' :
            question.tier === 'developing' ? 'text-amber-300' :
            'text-red-300'
          }`} style={{
            background: question.tier === 'introductory' ? 'rgba(34,197,94,0.15)' :
            question.tier === 'developing' ? 'rgba(255,184,0,0.15)' :
            'rgba(255,71,87,0.15)',
          }}>
            {question.tier}
          </span>
          <span className="text-xs text-bark-light capitalize">{question.subject.replace('_', ' ')}</span>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(0,200,150,0.06)',
            border: '1px solid rgba(0,200,150,0.1)',
          }}
        >
          <p className="font-display text-lg md:text-xl font-bold text-white leading-relaxed">{question.themeHook}</p>
        </div>
      </div>

      {/* Answer area */}
      <div className="space-y-2">
        {question.questionType === 'multiple_choice' && question.options?.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = feedback && opt === question.correctAnswer;
          const isWrong = feedback && isSelected && !feedback.correct;

          return (
            <button
              key={opt}
              onClick={() => !feedback && setSelected(opt)}
              disabled={!!feedback}
              className={`w-full rounded-xl p-4 md:p-5 min-h-[52px] text-base md:text-lg text-left font-semibold transition-all ${
                isCorrect ? 'text-white animate-bounce-in' :
                isWrong ? 'text-white animate-shake' :
                isSelected ? 'text-white' :
                'text-bark hover:scale-[1.01]'
              }`}
              style={
                isCorrect ? {
                  background: 'rgba(34,197,94,0.2)',
                  border: '2px solid #22c55e',
                  boxShadow: '0 0 16px rgba(34,197,94,0.3)',
                } :
                isWrong ? {
                  background: 'rgba(255,71,87,0.2)',
                  border: '2px solid #ff4757',
                  boxShadow: '0 0 16px rgba(255,71,87,0.3)',
                } :
                isSelected ? {
                  background: 'rgba(0,200,150,0.15)',
                  border: '2px solid rgba(0,200,150,0.6)',
                  boxShadow: '0 0 12px rgba(0,200,150,0.2)',
                } : {
                  background: 'rgba(255,255,255,0.06)',
                  border: '2px solid rgba(255,255,255,0.1)',
                }
              }
              aria-label={opt}
              aria-pressed={isSelected}
            >
              {opt}
            </button>
          );
        })}

        {question.questionType === 'fill_in' && (
          <input
            type="text"
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            disabled={!!feedback}
            placeholder="Type your answer..."
            className="w-full rounded-xl p-4 md:p-5 text-base md:text-lg min-h-[52px] text-white placeholder-bark-light/50 focus:outline-none disabled:opacity-60"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
            aria-label="Your answer"
          />
        )}

        {question.questionType === 'sequencing' && question.sequenceItems && (
          <div className="space-y-2">
            <p className="text-sm text-bark-light">Put these in order (tap to select):</p>
            {/* Selected order */}
            {sequenceOrder.length > 0 && (
              <div className="space-y-1 mb-2">
                {sequenceOrder.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-white"
                    style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.2)' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #00c896, #00a67a)' }}
                    >{i + 1}</span>
                    <span className="flex-1">{item}</span>
                    {!feedback && (
                      <button onClick={() => toggleSequenceItem(item)} className="text-bark-light hover:text-danger text-xs" aria-label={`Remove ${item}`}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Available items */}
            {question.sequenceItems.filter((item) => !sequenceOrder.includes(item)).map((item) => (
              <button
                key={item}
                onClick={() => toggleSequenceItem(item)}
                disabled={!!feedback}
                className="w-full rounded-xl p-3 md:p-4 text-left text-base min-h-[48px] text-bark transition-all disabled:opacity-60 hover:scale-[1.01]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
                aria-label={`Select: ${item}`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint button */}
      {!feedback && question.hint && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="text-sm text-gold hover:text-gold-light transition-colors font-bold"
          aria-label="Show hint"
        >
          Need a hint?
        </button>
      )}
      {showHint && question.hint && (
        <div
          className="rounded-xl p-3 text-sm text-bark animate-slide-up"
          style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)' }}
        >
          {question.hint}
        </div>
      )}

      {/* Submit / Feedback */}
      {!feedback ? (
        <button
          onClick={handleSubmit}
          disabled={
            (question.questionType === 'multiple_choice' && !selected) ||
            (question.questionType === 'fill_in' && !fillAnswer.trim()) ||
            (question.questionType === 'sequencing' && sequenceOrder.length !== (question.sequenceItems?.length ?? 0))
          }
          className="w-full rounded-xl p-4 md:p-5 font-display font-bold text-lg min-h-[56px] text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
            boxShadow: '0 4px 0 #008060, 0 0 20px rgba(0,200,150,0.2)',
          }}
          aria-label="Submit answer"
        >
          Submit Answer
        </button>
      ) : (
        <div className="space-y-3 animate-slide-up">
          <div
            className="rounded-xl p-4"
            style={feedback.correct ? {
              background: 'rgba(34,197,94,0.12)',
              border: '2px solid rgba(34,197,94,0.4)',
              boxShadow: '0 0 20px rgba(34,197,94,0.15)',
            } : {
              background: 'rgba(255,71,87,0.12)',
              border: '2px solid rgba(255,71,87,0.4)',
              boxShadow: '0 0 20px rgba(255,71,87,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{feedback.correct ? '✅' : '❌'}</span>
              <span className="font-bold font-display text-white text-lg">{feedback.correct ? getNarrative('correct_answer') : getNarrative('wrong_answer')}</span>
            </div>
            <p className="text-sm text-bark-light">{feedback.explanation}</p>
            <p className="text-sm font-bold mt-1 text-gold" style={{ textShadow: '0 0 10px rgba(255,184,0,0.3)' }}>+{feedback.xp} XP</p>
          </div>

          {shouldShowFrustrationPivot && (
            <div
              className="rounded-xl p-3 text-sm text-bark animate-slide-up"
              style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)' }}
            >
              {getNarrative('frustration_pivot')}
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full rounded-xl p-4 md:p-5 font-display font-bold text-lg min-h-[56px] text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
              boxShadow: '0 4px 0 #008060, 0 0 20px rgba(0,200,150,0.2)',
            }}
            aria-label="Continue to next question"
          >
            {session.currentQuestionIndex + 1 >= session.questions.length ? 'See Results' : 'Next Clue →'}
          </button>
        </div>
      )}

      {/* Milestone popup */}
      {showMilestone && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" role="dialog" aria-label="Milestone reached">
          <div
            className="rounded-2xl p-6 max-w-sm w-full text-center discovery-reveal"
            style={{
              background: 'linear-gradient(165deg, #162032, #1a3a2a)',
              border: '2px solid rgba(255,184,0,0.4)',
              boxShadow: '0 0 40px rgba(255,184,0,0.2), 0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="font-display text-xl font-bold text-gold mb-2">Milestone!</h3>
            <p className="text-bark-light">{showMilestone}</p>
            <button
              onClick={() => setShowMilestone(null)}
              className="mt-4 rounded-xl px-6 py-2 font-bold font-display text-white transition-all hover:scale-[1.05] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                boxShadow: '0 3px 0 #cc7700',
              }}
              aria-label="Dismiss milestone"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
