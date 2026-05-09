import { useState, useCallback, useEffect } from 'react';

const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentText(null);
  }, []);

  const speak = useCallback((text) => {
    if (!text) return;

    // If already speaking the same text, stop it
    if (isSpeaking && currentText === text) {
      stop();
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Clean markdown/html for better speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.') // Remove code blocks
      .replace(/[#*`_~]/g, '') // Remove markdown symbols
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentText(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, currentText, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return { speak, stop, isSpeaking, currentText };
};

export default useTTS;
