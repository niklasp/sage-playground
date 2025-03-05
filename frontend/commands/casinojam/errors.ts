// map the error codes to human readable errors
// https://github.com/ajuna-network/ajuna-pallets/blob/develop/sage/example-transition/src/error.rs

export const TRANSITION_ERROR_CODES = {
  // Asset type errors
  100: "Assets not all same type",
  101: "Asset type not found in account",
  102: "Asset type already in account",

  // Asset fund operation errors
  150: "Asset could not receive funds",
  151: "Asset could not withdraw funds",
  152: "Asset could not withdraw play fee",
  153: "Asset could not receive play fee",
  154: "Asset could not withdraw max reward",
  155: "Asset could not receive max reward",
  156: "Asset could not withdraw spin reward",
  157: "Asset could not receive spin reward",

  // Machine operation errors
  160: "Could not perform machine spins",

  // Seat management errors
  170: "Machine cannot rent more seats",
  171: "Seat is not linked to player",
  172: "Seat reservation has expired",
  173: "Seat is not linked to specified player",
  174: "Seat has no funds",
  175: "Seat reservation is not valid",

  // Asset validation errors
  200: "Asset not found",
  201: "Asset score not enough",
  202: "Asset type not valid",
  203: "Asset variant is not player",
  204: "Asset variant is not machine",
  205: "Asset variant is not human",
  206: "Asset variant is not tracker",
  207: "Asset variant is not seat",
};
