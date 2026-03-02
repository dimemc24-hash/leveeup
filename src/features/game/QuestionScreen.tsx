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
        <button onClick={handleQuit} className="text-bark-light text-sm hover:text-bark" aria-label="Quit session">
          ✕
        </button>
        <div className="flex-1 bg-paper-dark rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={session.currentQuestionIndex + 1} aria-valuemax={session.questions.length}>
          <div className="bg-forest-light h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-bark-light">{session.currentQuestionIndex + 1}/{session.questions.length}</span>
      </div>

      {/* Streak indicator */}
      {streakLabel && (
        <div className="text-center streak-fire">
          <span className="inline-block bg-gold text-white text-sm font-bold px-3 py-1 rounded-full animate-bounce-in">
            {streakLabel}
          </span>
        </div>
      )}

      {/* Narrative question — themeHook IS the question */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-paper-dark">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            question.tier === 'introductory' ? 'bg-green-100 text-green-700' :
            question.tier === 'developing' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {question.tier}
          </span>
          <span className="text-xs text-bark-light capitalize">{question.subject.replace('_', ' ')}</span>
        </div>
        <div className="bg-forest/5 rounded-xl p-4 border border-forest/10">
          <p className="font-display text-base font-bold text-bark leading-relaxed">{question.themeHook}</p>
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
              className={`w-full rounded-xl p-4 text-left border-2 transition-all ${
                isCorrect ? 'border-forest-light bg-green-50 text-forest' :
                isWrong ? 'border-danger bg-red-50 text-danger animate-shake' :
                isSelected ? 'border-forest bg-forest/5' :
                'border-paper-dark bg-white hover:border-forest/40'
              }`}
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
            className="w-full rounded-xl p-4 border-2 border-paper-dark bg-white focus:border-forest focus:outline-none disabled:opacity-60"
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
                  <div key={item} className="flex items-center gap-2 bg-forest/10 rounded-lg p-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
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
                className="w-full rounded-xl p-3 text-left border-2 border-paper-dark bg-white hover:border-forest/40 text-sm transition-all disabled:opacity-60"
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
          className="text-sm text-gold hover:text-gold-light transition-colors"
          aria-label="Show hint"
        >
          Need a hint?
        </button>
      )}
      {showHint && question.hint && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 text-sm text-bark animate-slide-up">
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
          className="w-full bg-forest text-white rounded-xl p-4 font-bold hover:bg-forest-light transition-colors disabled:opacity-40 shadow-md"
          aria-label="Submit answer"
        >
          Submit Answer
        </button>
      ) : (
        <div className="space-y-3 animate-slide-up">
          <div className={`rounded-xl p-4 ${feedback.correct ? 'bg-green-50 border-2 border-forest-light' : 'bg-red-50 border-2 border-danger'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{feedback.correct ? '✅' : '❌'}</span>
              <span className="font-bold">{feedback.correct ? getNarrative('correct_answer') : getNarrative('wrong_answer')}</span>
            </div>
            <p className="text-sm text-bark-light">{feedback.explanation}</p>
            <p className="text-sm font-bold mt-1 text-gold">+{feedback.xp} XP</p>
          </div>

          {shouldShowFrustrationPivot && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 text-sm text-bark animate-slide-up">
              {getNarrative('frustration_pivot')}
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-forest text-white rounded-xl p-4 font-bold hover:bg-forest-light transition-colors shadow-md"
            aria-label="Continue to next question"
          >
            {session.currentQuestionIndex + 1 >= session.questions.length ? 'See Results' : 'Next Clue →'}
          </button>
        </div>
      )}

      {/* Milestone popup */}
      {showMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" role="dialog" aria-label="Milestone reached">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center discovery-reveal shadow-xl">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-display text-xl font-bold text-forest mb-2">Milestone!</h3>
            <p className="text-bark-light">{showMilestone}</p>
            <button
              onClick={() => setShowMilestone(null)}
              className="mt-4 bg-forest text-white rounded-xl px-6 py-2 font-bold hover:bg-forest-light"
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
