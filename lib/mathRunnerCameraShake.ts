let shakeAmount = 0;

export function addCameraShake(amount: number) {
  shakeAmount = Math.min(1.2, shakeAmount + amount);
}

export function consumeCameraShake(delta: number) {
  const current = shakeAmount;
  shakeAmount = Math.max(0, shakeAmount - delta * 2.2);
  return current;
}

