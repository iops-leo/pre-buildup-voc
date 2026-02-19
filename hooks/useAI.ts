'use client';

import { useState, useCallback, useRef } from 'react';

export type AIRequestType = 'explain_wrong' | 'example_sentence' | 'quiz_feedback';

interface AIContext {
  // explain_wrong
  meaning?: string;
  correctAnswer?: string;
  // example_sentence
  word?: string;
  // quiz_feedback
  percentage?: number;
  correct?: number;
  total?: number;
  duration?: number;
  wrongWords?: string[];
  mode?: string;
}

// Simple in-memory cache (persists across re-renders within same session)
const aiCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(type: AIRequestType, context: AIContext): string {
  return `${type}:${JSON.stringify(context)}`;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(async (type: AIRequestType, context: AIContext): Promise<string | null> => {
    const cacheKey = getCacheKey(type, context);

    // Check cache
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error('AI 서비스에 연결할 수 없어요');
      }

      const data = await res.json();
      const content = data.content || '';

      // Only cache non-empty results
      if (content.trim()) {
        aiCache.set(cacheKey, { data: content, timestamp: Date.now() });
      }

      setIsLoading(false);
      return content;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      const message = err instanceof Error ? err.message : 'AI 요청에 실패했어요';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, []);

  return { ask, isLoading, error };
}
