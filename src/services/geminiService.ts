/**
 * BACKWARDS COMPATIBILITY LAYER
 * All AI logic has migrated to Groq (Llama 3.3 70B / 8B) in ./aiService.ts.
 * This file re-exports all identifiers so existing imports continue working seamlessly.
 */

export * from './aiService';
