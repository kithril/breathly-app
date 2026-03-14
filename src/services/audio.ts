import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";
import { sounds } from "@breathly/assets/sounds";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";

(async function () {
  setAudioModeAsync({ playsInSilentMode: true });
})();

export type GuidedBreathingStep = "breatheIn" | "breatheOut" | "hold";

type GuidedBreathingAudioSounds = {
  [key in GuidedBreathingMode]: {
    [key in GuidedBreathingStep]: number | undefined; // Metro asset handle
  };
};

const guidedBreathingAudioAssets: GuidedBreathingAudioSounds = {
  laura: {
    breatheIn: sounds.lauraBreatheIn,
    breatheOut: sounds.lauraBreatheOut,
    hold: sounds.lauraHold,
  },
  paul: {
    breatheIn: sounds.paulBreatheIn,
    breatheOut: sounds.paulBreatheOut,
    hold: sounds.paulHold,
  },
  bell: {
    breatheIn: sounds.cueBell1,
    breatheOut: sounds.cueBell1,
    hold: sounds.cueBell2,
  },
  disabled: {
    breatheIn: undefined,
    breatheOut: undefined,
    hold: undefined,
  },
};

type CurrentGuidedBreathingSounds = {
  [key in GuidedBreathingStep]: AudioPlayer | undefined;
};

let currentGuidedBreathingSounds: CurrentGuidedBreathingSounds | undefined;
let endingBellSound: AudioPlayer | undefined;

export async function setupGuidedBreathingAudio(guidedBreathingMode: GuidedBreathingMode) {
  endingBellSound = createAudioPlayer(sounds.endingBell);
  
  const breatheIn = guidedBreathingAudioAssets[guidedBreathingMode].breatheIn;
  const breatheOut = guidedBreathingAudioAssets[guidedBreathingMode].breatheOut;
  const hold = guidedBreathingAudioAssets[guidedBreathingMode].hold;

  currentGuidedBreathingSounds = {
    breatheIn: breatheIn ? createAudioPlayer(breatheIn) : undefined,
    breatheOut: breatheOut ? createAudioPlayer(breatheOut) : undefined,
    hold: hold ? createAudioPlayer(hold) : undefined,
  };
}

export const releaseGuidedBreathingAudio = async () => {
  endingBellSound?.remove();
  currentGuidedBreathingSounds?.breatheIn?.remove();
  currentGuidedBreathingSounds?.breatheOut?.remove();
  currentGuidedBreathingSounds?.hold?.remove();

  endingBellSound = undefined;
  currentGuidedBreathingSounds = undefined;
};

export const playGuidedBreathingSound = async (guidedBreathingStep: GuidedBreathingStep) => {
  const player = currentGuidedBreathingSounds?.[guidedBreathingStep];
  if (player) {
    await player.seekTo(0);
    player.play();
  }
};

export const playEndingBellSound = async () => {
  if (endingBellSound) {
    await endingBellSound.seekTo(0);
    endingBellSound.play();
  }
};
