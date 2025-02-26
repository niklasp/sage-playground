import type { Command, CommandContext } from "@/types/command";
import {
  formatTransitionError,
  isCasinoJamApi,
  validateRentDurationType,
} from "./util";
import { CasinojamDispatchError } from "@polkadot-api/descriptors";
import { RentDurationType } from "./types";

export const DEFAULT_RENT_DURATION: RentDurationType = {
  type: "Days7",
  value: undefined,
};

export const rent: Command = {
  execute: async (args: string[], context: CommandContext) => {
    const { api, activeSigner, selectedAccount } = context;

    if (!api || !isCasinoJamApi(api)) return "No CasinoJam API available";
    if (!activeSigner || !selectedAccount)
      return "Please connect and select an account first";

    if (args.length !== 2 && args.length !== 1) {
      return "Error: The syntax is 'rent [machine_id] or rent [machine_id] [rent_duration]'";
    }

    const machineIdArg = args[0];
    const rentDurationArg = args[1] ?? DEFAULT_RENT_DURATION;

    // does the asset exist?
    const casinoJamAssets = await api.query.CasinoJamSage.Assets.getEntries();
    const machine = casinoJamAssets.find(
      ({ value: [, asset] }) =>
        asset.variant.type === "Machine" && asset.id === parseInt(machineIdArg)
    );

    if (!machine) {
      return "Error: Machine not found";
    }

    // is the rent duration valid?
    const rentDuration = validateRentDurationType(rentDurationArg);

    // execute the call to SAGE
    const tx = await api.tx.CasinoJamSage.state_transition({
      transition_id: {
        type: "Rent",
        value: rentDuration,
      },
      asset_ids: [parseInt(machineIdArg)],
      payment_kind: undefined,
    });

    const result = await tx.signAndSubmit(activeSigner, { at: "best" });
    console.info("result machine deposit", result);

    if (result.ok) {
      return `✅ Machine ${machineIdArg} rented with multiplier ${rentDuration}`;
    } else {
      const err = result.dispatchError.value as CasinojamDispatchError;
      return formatTransitionError(err);
    }
  },
  help: {
    command: "rent [machine_id] ([multiplier])",
    description:
      "Rent a machine with id [machine_id] (with a multiplier of [multiplier])",
  },
};
