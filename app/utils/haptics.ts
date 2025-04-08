import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

const useHapticFeedback = () => {
  const triggerHaptic = useCallback(
    (type) => {
      switch (type) {
        case 'impact':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'notification':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'heavyImpact':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'lightImpact':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        default:
          console.warn('Unknown haptic type');
      }
    },
    []
  );

  return triggerHaptic;
};

export default useHapticFeedback;