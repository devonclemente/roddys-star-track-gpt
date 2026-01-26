import { useState, useCallback, useRef } from 'react';

export interface MovementStep {
  position: number;
  type: 'move' | 'collision' | 'special-star' | 'special-numbered' | 'bump';
}

export interface AnimationState {
  isAnimating: boolean;
  currentStep: number;
  displayPosition: number;
  steps: MovementStep[];
}

const STEP_DURATION = 250; // ms per hop
const PAUSE_AFTER_MOVEMENT = 500; // ms pause before effects

export function useMovementAnimation() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentStep: 0,
    displayPosition: 0,
    steps: [],
  });
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const clearAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animateStep = useCallback((steps: MovementStep[], stepIndex: number) => {
    if (stepIndex >= steps.length) {
      // Animation complete
      setAnimationState(prev => ({
        ...prev,
        isAnimating: false,
        currentStep: steps.length,
      }));
      
      // Call completion callback after pause
      setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
          onCompleteRef.current = null;
        }
      }, PAUSE_AFTER_MOVEMENT);
      return;
    }

    // Safe array access to prevent object injection (CWE-94)
    const step = steps.at(stepIndex);
    if (!step) return;
    
    setAnimationState(prev => ({
      ...prev,
      currentStep: stepIndex,
      displayPosition: step.position,
    }));

    // Schedule next step
    animationRef.current = setTimeout(() => {
      animateStep(steps, stepIndex + 1);
    }, STEP_DURATION);
  }, []);

  const startAnimation = useCallback((
    fromPosition: number,
    steps: MovementStep[],
    onComplete?: () => void
  ) => {
    clearAnimation();
    onCompleteRef.current = onComplete ?? null;
    
    setAnimationState({
      isAnimating: true,
      currentStep: 0,
      displayPosition: fromPosition,
      steps,
    });

    // Start animation after a brief delay
    animationRef.current = setTimeout(() => {
      animateStep(steps, 0);
    }, 100);
  }, [clearAnimation, animateStep]);

  const stopAnimation = useCallback(() => {
    clearAnimation();
    setAnimationState(prev => ({
      ...prev,
      isAnimating: false,
    }));
  }, [clearAnimation]);

  return {
    animationState,
    startAnimation,
    stopAnimation,
    isAnimating: animationState.isAnimating,
    displayPosition: animationState.displayPosition,
  };
}

// Generate movement steps from start to end position
export function generateMovementSteps(
  fromPosition: number,
  toPosition: number,
  stepType: MovementStep['type'] = 'move'
): MovementStep[] {
  const steps: MovementStep[] = [];
  const direction = toPosition > fromPosition ? 1 : -1;
  
  let current = fromPosition;
  while (current !== toPosition) {
    current += direction;
    steps.push({ position: current, type: stepType });
  }
  
  return steps;
}
