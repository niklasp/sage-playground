import type { Command, CommandContext } from "@/types/command";
import { formatTransitionError, isCasinoJamApi } from "./util";
import { CasinojamDispatchError } from "@polkadot-api/descriptors";
import { SeatType } from "./types";

export const DEFAULT_MULTIPLIER = "V1";

export const remove: Command = {
  execute: async (args: string[], context: CommandContext) => {
    const { api, activeSigner, selectedAccount } = context;

    if (!api || !isCasinoJamApi(api)) return "No CasinoJam API available";
    if (!activeSigner || !selectedAccount)
      return "Please connect and select an account first";

    if (args.length !== 1) {
      return "Error: The syntax is 'remove <seat_id>'";
    }

    const casinoJamAssets = await api.query.CasinoJamSage.Assets.getEntries();

    const seatIdArg = args[0];

    if (!seatIdArg) {
      return "Error: No seat ID provided";
    }

    // does the seat exist?
    const seat = casinoJamAssets.find(
      ({ value: [owner, asset] }) =>
        asset.variant.type === "Seat" &&
        owner === selectedAccount.address &&
        asset.id === parseInt(seatIdArg)
    )?.value[1].variant.value as SeatType;

    if (!seat) {
      return "Error: Seat not found or not owned by you";
    }

    const machineId = seat.machine_id;

    if (!machineId) {
      return "Error: Machine not found";
    }

    const seatToRemoveId = parseInt(seatIdArg);

    console.info(`removing seat ${seatToRemoveId} from machine ${machineId}`);

    const tx = await api.tx.CasinoJamSage.state_transition({
      transition_id: {
        type: "Return",
        value: undefined,
      },
      asset_ids: [machineId, seatToRemoveId],
      payment_kind: undefined,
    });

    const result = await tx.signAndSubmit(activeSigner, { at: "best" });
    console.info("result release", result);

    if (result.ok) {
      return `✅ Seat ${seatToRemoveId} removed from machine ${machineId}`;
    } else {
      const err = result.dispatchError as CasinojamDispatchError;
      return formatTransitionError(err);
    }
  },
  help: {
    command: "remove [seat_id]",
    description: "Remove your seat from a machine",
  },
};
