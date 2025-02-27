import { CasinojamErrors, CasinojamQueries } from "@polkadot-api/descriptors";

export type AssetWithKey = CasinojamQueries["CasinoJamSage"]["Assets"]["Value"];
export type AssetType = AssetWithKey[1];
export type AssetTypeVariant = AssetType["variant"];

export type MachineType = Extract<
  AssetTypeVariant,
  { type: "Machine" }
>["value"];
export type SeatType = Extract<AssetTypeVariant, { type: "Seat" }>["value"];
export type MultiplierType = MachineType["value_1_mul"];
export type MultiplierValuesType = MultiplierType extends { type: infer T }
  ? T
  : never;

export type RentDurationType = SeatType["rent_duration"];
export type RentDurationValuesType = RentDurationType extends { type: infer T }
  ? T
  : never;

export type ReservationDurationType = SeatType["reservation_duration"];
export type ReservationDurationValuesType = ReservationDurationType extends {
  type: infer T;
}
  ? T
  : never;

export type TokenType = MachineType["value_1_factor"];
export type TokenValuesType = TokenType extends { type: infer T } ? T : never;

export type PlayerType = Extract<AssetTypeVariant, { type: "Player" }>["value"];
export type PlayerTrackerType = Extract<
  PlayerType,
  { type: "Tracker" }
>["value"];

export interface UnpackedSlotResult {
  slot1: number;
  slot2: number;
  slot3: number;
  bonus1: number;
  bonus2: number;
}

export type CasinoJamSageError = CasinojamErrors["CasinoJamSage"];

export type CasinojamTransitionError =
  CasinojamErrors["CasinoJamSage"]["Transition"];
