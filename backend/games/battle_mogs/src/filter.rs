use crate::asset::{mogwai::RarityType, BattleMogsAsset, BattleMogsVariant};

use ajuna_primitives::trade_manager::*;

use sp_runtime::traits::BlockNumber as BlockNumberT;
use sp_std::marker::PhantomData;

#[derive(Default)]
pub struct GameFilter<BlockNumber>(PhantomData<BlockNumber>);

impl<BlockNumber> TradeManager for GameFilter<BlockNumber>
where
	BlockNumber: BlockNumberT,
{
	type TradeFilter = RarityType;
	type Asset = BattleMogsAsset<BlockNumber>;

	fn can_be_traded_using(asset: &Self::Asset, filter: &Self::TradeFilter) -> bool {
		match asset.variant {
			BattleMogsVariant::Mogwai(mogwai) => mogwai.rarity == *filter,
			_ => false,
		}
	}
}

impl<BlockNumber> TransferManager for GameFilter<BlockNumber>
where
	BlockNumber: BlockNumberT,
{
	type TransferFilter = RarityType;
	type Asset = BattleMogsAsset<BlockNumber>;

	fn can_be_transferred_using(asset: &Self::Asset, filter: &Self::TransferFilter) -> bool {
		match asset.variant {
			BattleMogsVariant::Mogwai(mogwai) => mogwai.rarity == *filter,
			_ => false,
		}
	}
}
