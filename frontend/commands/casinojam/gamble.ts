import { Command } from "@/types/command";
import {
  isCasinoJamApi,
  formatTransitionError,
  validateMultiplierType,
  unpackSlotResult,
  displaySlotMachine,
} from "./util";
import { PlayerTrackerType, PlayerType, SeatType } from "./types";
import { CasinojamDispatchError } from "@polkadot-api/descriptors";
import { gambleInfo } from "./gamble-info";
import { animateSpinning } from "@/lib/animate-spinning";

const DEFAULT_MULTIPLIER = "V4";

export const gamble: Command = {
  execute: async (
    args: string[],
    { onProcessing, api, activeSigner, selectedAccount, client }
  ) => {
    if (!onProcessing) return "Error: Processing callback not available";

    if (args[0] === "info") {
      return gambleInfo.execute(args, {
        onProcessing,
        api,
        activeSigner,
        selectedAccount,
      });
    }

    if (!api || !isCasinoJamApi(api))
      return "Error: API or client not available";

    if (!activeSigner || !selectedAccount)
      return "Please connect and select an account first";

    if (args.length > 1) return "Invalid command, use gamble ([multiplier])";

    const chainInfo = await client?.getChainSpecData();

    const multiplierArg = args[0]?.toUpperCase() ?? DEFAULT_MULTIPLIER;
    const multiplier = validateMultiplierType(multiplierArg);

    // retrieve all required assets for the gamble extrinsic:
    // player, tracker, seat, machine
    let casinoJamAssets = await api.query.CasinoJamSage.Assets.getEntries();
    const players = casinoJamAssets.filter(
      ({ value: [, asset] }) =>
        asset.variant.type === "Player" && asset.variant.value.type === "Human"
    );
    const me = players.find(
      ({ value: [owner] }) => owner === selectedAccount.address
    );

    if (!me) return "You are not a player";

    const playerId = me?.value[1].id;
    const meTrackerId = casinoJamAssets.filter(
      ({ value: [owner, asset] }) =>
        asset.variant.type === "Player" &&
        asset.variant.value.type === "Tracker" &&
        owner === selectedAccount.address
    )?.[0]?.value[1].id;

    const currentSeat = casinoJamAssets.find(
      ({ value: [, asset] }) =>
        asset.variant.type === "Seat" &&
        asset.variant.value.player_id === me?.value[1].id
    );

    if (!currentSeat) return "You are not in a seat";

    const currentSeatId = currentSeat?.value[1].id;
    const currentMachineId = (currentSeat?.value[1].variant.value as SeatType)
      .machine_id;

    if (!currentSeatId || !currentMachineId)
      return "You are not in a seat or machine";

    if (!meTrackerId) return "You dont have a tracker";

    // craft the gamble params
    const tx = api.tx.CasinoJamSage.state_transition({
      transition_id: { type: "Gamble", value: multiplier },
      asset_ids: [playerId, meTrackerId, currentSeatId, currentMachineId],
      payment_kind: undefined,
    });

    const multiplierInt = parseInt(
      multiplierArg.toUpperCase().replace("V", "")
    );

    const stopSignal = { shouldStop: false };
    const animationPromise = animateSpinning(
      onProcessing,
      stopSignal,
      multiplierInt
    );

    try {
      const result = await tx.signAndSubmit(activeSigner, {
        at: "best",
      });
      stopSignal.shouldStop = true;
      await animationPromise;

      console.info("result gamble", result);

      if (result.ok) {
        // get the results from the tracker
        casinoJamAssets = await api.query.CasinoJamSage.Assets.getEntries();
        const tracker = casinoJamAssets.find(
          ({ value: [owner, asset] }) =>
            asset.variant.type === "Player" &&
            asset.variant.value.type === "Tracker" &&
            owner === selectedAccount.address
        );

        const playerValue = tracker?.value[1].variant.value as PlayerType;
        const trackerValue = playerValue.value as PlayerTrackerType;

        console.info("tracker after gamble", trackerValue);

        // Get slot results based on multiplier
        const slotResults = [];
        if (multiplierInt >= 1)
          slotResults.push(unpackSlotResult(trackerValue.slot_a_result));
        if (multiplierInt >= 2)
          slotResults.push(unpackSlotResult(trackerValue.slot_b_result));
        if (multiplierInt >= 3)
          slotResults.push(unpackSlotResult(trackerValue.slot_c_result));
        if (multiplierInt >= 4)
          slotResults.push(unpackSlotResult(trackerValue.slot_d_result));

        return displaySlotMachine({
          multiplier: multiplierInt,
          wheels: slotResults,
          rewardUnit: chainInfo?.properties.tokenSymbol,
        });
      } else {
        const err = result.dispatchError as CasinojamDispatchError;
        return formatTransitionError(err);
      }
    } finally {
      stopSignal.shouldStop = true;
    }
  },
  help: {
    command: "gamble [multiplier]",
    description: "Try your luck at the slot machine",
  },
};
