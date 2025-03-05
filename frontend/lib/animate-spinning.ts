import { sleep } from "@/commands/casinojam/util";
import { displaySlotMachine } from "@/commands/casinojam/util";
import { UnpackedSlotResult } from "@/commands/casinojam/types";

export async function animateSpinning(
  onProcessing: (output: string) => void,
  stopSignal: { shouldStop: boolean },
  multiplier: number
) {
  if (!onProcessing) return;

  try {
    while (!stopSignal.shouldStop) {
      // Always generate exactly 1 wheel for the animation
      const spinningWheels: UnpackedSlotResult[] = Array(multiplier)
        .fill(null)
        .map(() => {
          return {
            slot1: Math.floor(Math.random() * 10), // 0-9 for main slots
            slot2: Math.floor(Math.random() * 10),
            slot3: Math.floor(Math.random() * 10),
            bonus1: Math.floor(Math.random() * 10), // 0-9 for bonus slots
            bonus2: Math.floor(Math.random() * 10),
          };
        });

      const spinningDisplay = displaySlotMachine({
        multiplier: multiplier, // Use the multiplier value for display
        wheels: spinningWheels, // Always just one wheel
        rewardUnit: "AJUN",
        isSpinning: true,
      });

      onProcessing(`${spinningDisplay}\n\n`);
      await sleep(100);
    }
  } catch (error) {
    console.error("Animation error:", error);
  }
}
