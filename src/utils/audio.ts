// Audio subsystem disabled per design requirements (100% Silent Mode)

class SoundEngine {
  public isMuted: boolean = true;

  public toggleMute(): boolean {
    return true;
  }

  public playClick() {}
  public playCorrect() {}
  public playIncorrect() {}
  public playFlip() {}
  public playFanfare() {}
  public playVictory() {}
}

export const soundFx = new SoundEngine();
