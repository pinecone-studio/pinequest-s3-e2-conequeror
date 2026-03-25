"use client";

import { useState } from "react";

export function useExamNavigation(total: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return {
    currentIndex,
    answers,
    goNext,
    goPrev,
    goTo,
    selectAnswer,
  };
}
