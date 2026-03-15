import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { wordPacks, getSentenceForWord, getSpellingTip, spellCasterCryptids } from '../../data/spellCasterWords';
import { HandwritingCanvas, type HandwritingCanvasRef } from './HandwritingCanvas';
import { speak } from '../../lib/tts';
import { recognizeHandwriting, isSpellingCorrect } from '../../lib/ocr';
import type { SpellCasterCryptid } from '../../data/spellCasterWords';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';

type Phase = 'writing' | 'checking' | 'correct' | 'wrong' | 'complete';

export function SpellCasterPlay() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const pack = wordPacks.find((p) => p.id === packId);
  const [wordIndex, setWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('writing');
  const [recognizedWord, setRecognizedWord] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const canvasRef = useRef<HandwritingCanvasRef>(null);

  const words = pack?.words ?? [];
  const currentWord = words[wordIndex];
  const cryptidIndex = Math.min(wordIndex, spellCasterCryptids.length - 1);
  const currentCryptid: SpellCasterCryptid | null = spellCasterCryptids[cryptidIndex] ?? null;

  const speakWord = useCallback(async () => {
    if (!currentWord) return;
    setErrorMessage('');
    try {
      await speak(currentWord);
    } catch {
      setErrorMessage('Could not play sound. Try again.');
    }
  }, [currentWord]);

  const speakSentence = useCallback(async () => {
    if (!currentWord) return;
    setErrorMessage('');
    try {
      await speak(getSentenceForWord(currentWord));
    } catch {
      setErrorMessage('Could not play sound. Try again.');
    }
  }, [currentWord]);

  useEffect(() => {
    if (currentWord && phase === 'writing') speakWord();
  }, [wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps -- speak when word changes

  const handleCheckSpelling = useCallback(async () => {
    if (!currentWord || !canvasRef.current) return;
    const dataUrl = canvasRef.current.getDataUrl();
    if (!dataUrl) return;
    setPhase('checking');
    setErrorMessage('');
    try {
      const word = await recognizeHandwriting(dataUrl);
      setRecognizedWord(word);
      if (isSpellingCorrect(word, currentWord)) {
        setPhase('correct');
      } else {
        setPhase('wrong');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not read your writing. Try again.');
      setPhase('writing');
    }
  }, [currentWord]);

  const handleTryAgain = useCallback(() => {
    canvasRef.current?.clear();
    setPhase('writing');
    setRecognizedWord('');
    setErrorMessage('');
    speakWord();
  }, [speakWord]);

  const handleNext = useCallback(() => {
    const fromCorrect = phase === 'correct';
    if (fromCorrect) setCorrectCount((c) => c + 1);
    if (wordIndex >= words.length - 1) {
      const finalCorrect = correctCount + (fromCorrect ? 1 : 0);
      const { progress, profile } = useGameStore.getState();
      if (profile) {
        const xpEarned = 20 + finalCorrect * 10;
        const newProg = { ...progress, xp: progress.xp + xpEarned, totalXp: progress.totalXp + xpEarned, level: Math.floor((progress.totalXp + xpEarned) / 100) + 1 };
        storage.setProgress(profile.id, newProg);
        useGameStore.setState({ progress: newProg });
      }
      setPhase('complete');
      return;
    }
    canvasRef.current?.clear();
    setWordIndex((i) => i + 1);
    setPhase('writing');
    setRecognizedWord('');
    setErrorMessage('');
  }, [wordIndex, words.length, phase, correctCount]);

  if (!pack) {
    return (
      <div className="spell-caster-page p-4 text-center text-spell-cream">
        <p>Word pack not found.</p>
        <button
          type="button"
          onClick={() => navigate('/spell')}
          className="mt-4 px-4 py-2 rounded-xl bg-spell-accent text-spell-dark font-bold"
        >
          Back to menu
        </button>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="spell-caster-page p-4 max-w-lg mx-auto text-center space-y-6">
        <h2 className="font-display text-2xl font-bold text-spell-success">Pack complete!</h2>
        <p className="text-spell-cream">
          You spelled {correctCount} of {words.length} words.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/spell')}
            className="w-full py-4 rounded-2xl bg-spell-accent text-spell-dark font-bold text-lg"
          >
            Back to word packs
          </button>
          <button
            type="button"
            onClick={() => {
              setWordIndex(0);
              setCorrectCount(0);
              setPhase('writing');
              setRecognizedWord('');
              canvasRef.current?.clear();
            }}
            className="w-full py-4 rounded-2xl border-2 border-spell-accent text-spell-cream font-bold"
          >
            Play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="spell-caster spell-caster-page p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between text-spell-muted text-sm">
        <span>
          Word {wordIndex + 1} of {words.length}
        </span>
        <button
          type="button"
          onClick={() => navigate('/spell')}
          className="text-spell-accent font-medium"
          aria-label="Exit to menu"
        >
          Exit
        </button>
      </div>

      {phase === 'correct' && currentCryptid && (
        <div className="rounded-2xl p-6 bg-spell-success/20 border-2 border-spell-success text-center animate-bounce-in">
          <div className="text-5xl mb-2">{currentCryptid.emoji}</div>
          <h3 className="font-display font-bold text-spell-success text-xl">{currentCryptid.name}</h3>
          <p className="text-spell-cream text-sm mt-1">{currentCryptid.oneLiner}</p>
          <button
            type="button"
            onClick={handleNext}
            className="mt-4 w-full py-3 rounded-xl bg-spell-success text-white font-bold touch-target"
          >
            Next word
          </button>
        </div>
      )}

      {phase === 'wrong' && (
        <div className="rounded-2xl p-5 bg-spell-wrong/15 border-2 border-spell-wrong text-center animate-slide-up">
          <p className="text-spell-wrong font-bold">Not quite!</p>
          <p className="text-spell-cream mt-2">
            You wrote: <span className="font-mono font-bold">{recognizedWord || '(empty)'}</span>
          </p>
          <p className="text-spell-cream mt-1">
            Correct: <span className="font-mono font-bold text-spell-success">{currentWord}</span>
          </p>
          <p className="text-spell-tip text-sm mt-3 font-hand">{getSpellingTip(currentWord)}</p>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleTryAgain}
              className="flex-1 py-3 rounded-xl border-2 border-spell-accent text-spell-cream font-bold touch-target"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-spell-accent text-spell-dark font-bold touch-target"
            >
              Next word
            </button>
          </div>
        </div>
      )}

      {(phase === 'writing' || phase === 'checking') && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={speakWord}
              disabled={phase === 'checking'}
              className="px-4 py-3 rounded-xl bg-spell-accent text-spell-dark font-bold touch-target disabled:opacity-50"
              aria-label="Hear the word again"
            >
              Hear again
            </button>
            <button
              type="button"
              onClick={speakSentence}
              disabled={phase === 'checking'}
              className="px-4 py-3 rounded-xl border-2 border-spell-accent text-spell-cream font-bold touch-target disabled:opacity-50"
              aria-label="Use word in a sentence"
            >
              Use in a sentence
            </button>
          </div>

          {errorMessage && (
            <p className="text-spell-wrong text-sm" role="alert">
              {errorMessage}
            </p>
          )}

          <HandwritingCanvas ref={canvasRef} width={Math.min(520, window.innerWidth - 32)} height={420} />

          <button
            type="button"
            onClick={() => canvasRef.current?.clear()}
            className="w-full py-2.5 rounded-xl border-2 border-spell-muted text-spell-muted font-medium text-sm touch-target hover:bg-spell-card"
            aria-label="Clear your writing to start over"
          >
            Clear entry
          </button>

          <button
            type="button"
            onClick={handleCheckSpelling}
            disabled={phase === 'checking'}
            className="w-full py-4 rounded-2xl bg-spell-success text-white font-bold text-lg touch-target disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {phase === 'checking' ? (
              <>
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking…
              </>
            ) : (
              'Check spelling'
            )}
          </button>

        </>
      )}
    </div>
  );
}
