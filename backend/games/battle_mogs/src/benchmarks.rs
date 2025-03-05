use crate::{
	asset::{
		mogwai::{Mogwai, MogwaiGeneration, PhaseType, RarityType},
		BattleMogsAsset, BattleMogsId, BattleMogsVariant,
	},
	BattleMogsAction,
};

use ajuna_primitives::payment_handler::WithdrawKind;
use sage_api::benchmarks::SageBenchmarkHelper;

use frame_support::traits::fungible::NativeOrWithId;
use sp_runtime::traits::BlockNumber as BlockNumberT;
use sp_std::{marker::PhantomData, vec::Vec};

pub struct GameBenchmarkHelper<BlockNumber>(PhantomData<BlockNumber>);

pub type PaymentAssetId = u32;

impl<BlockNumber>
	SageBenchmarkHelper<
		BattleMogsId,
		BattleMogsAsset<BlockNumber>,
		BattleMogsAction,
		RarityType,
		RarityType,
		WithdrawKind<NativeOrWithId<PaymentAssetId>>,
	> for GameBenchmarkHelper<BlockNumber>
where
	BlockNumber: BlockNumberT,
{
	fn create_asset(seed: u32) -> (BattleMogsId, BattleMogsAsset<BlockNumber>) {
		let asset_id = BattleMogsId::from(seed);
		let asset = BattleMogsAsset::<BlockNumber> {
			id: asset_id,
			genesis: 0_u32.into(),
			variant: BattleMogsVariant::Mogwai(Mogwai {
				dna: [[0_u8; 32]; 2],
				generation: MogwaiGeneration::First,
				rarity: RarityType::Common,
				phase: PhaseType::Bred,
			}),
		};

		(asset_id, asset)
	}

	fn create_bench_transition() -> (BattleMogsAction, Vec<BattleMogsId>) {
		(BattleMogsAction::CreateMogwai, Vec::with_capacity(0))
	}

	fn create_trade_filter_for(asset: &BattleMogsAsset<BlockNumber>) -> RarityType {
		match asset.variant {
			BattleMogsVariant::Mogwai(mogwai) => mogwai.rarity,
			BattleMogsVariant::AchievementTable(_) => RarityType::Common,
		}
	}

	fn create_transfer_filter_for(asset: &BattleMogsAsset<BlockNumber>) -> RarityType {
		match asset.variant {
			BattleMogsVariant::Mogwai(mogwai) => mogwai.rarity,
			BattleMogsVariant::AchievementTable(_) => RarityType::Common,
		}
	}

	fn create_payment_kind() -> WithdrawKind<NativeOrWithId<PaymentAssetId>> {
		WithdrawKind::Payment(NativeOrWithId::Native)
	}
}
