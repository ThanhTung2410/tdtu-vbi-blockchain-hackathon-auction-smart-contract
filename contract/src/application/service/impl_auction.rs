use crate::models::auction::{AuctionId, AuctionMetadata};
use crate::models::contract::AuctionContractExt;
use crate::models::item::ItemId;
use crate::models::user::UserId;
use crate::models::{auction::ImplAuction, contract::AuctionContract};
use near_sdk::__private::schemars::Set;
use near_sdk::collections::UnorderedSet;
use near_sdk::{env, near_bindgen, Balance};

#[near_bindgen]
/// Implement function for auction
impl ImplAuction for AuctionContract {
    fn create_auction(
        &mut self,
        item_id: ItemId,

        auction_id: AuctionId,

        closed_at: u64,

        floor_price: Option<Balance>,

        winner: Option<UserId>,

        highest_bid: Option<Balance>,
    ) {
        let owner_id = env::signer_account_id();
        let auction = AuctionMetadata {
            item_id,
            auction_id,
            host_id: owner_id.clone(),
            created_at: env::block_timestamp_ms(),
            closed_at,
            floor_price,
            winner,
            highest_bid,
            users_join_auction: Set::new(),
        };

        let mut set_auction_user_host = self
            .auctions_host_per_user
            .get(&owner_id)
            .or_else(|| Some(UnorderedSet::new(owner_id.clone().to_string().into_bytes())))
            .unwrap();
        set_auction_user_host.insert(&auction_id);
        self.auctions_host_per_user
            .insert(&owner_id, &set_auction_user_host);
        self.auction_metadata_by_id.insert(&auction_id, &auction);
    }

    fn get_all_auctions_host_per_user(
        &self,
        user_id: UserId,
        start: Option<u32>,
        limit: Option<u32>,
    ) -> Vec<AuctionMetadata> {
        todo!()
    }

    fn get_auction_metadata_by_auction_id(&self, auction_id: AuctionId) -> Option<AuctionMetadata> {
        assert!(
            self.auction_metadata_by_id.contains_key(&auction_id),
            "Auction does not exist"
        );
        self.auction_metadata_by_id.get(&auction_id)
    }

    fn delete_auction(&mut self, auction_id: AuctionId) {
        // self.auctions_host_per_user
        let owner_id = env::signer_account_id();
        let auction = self.auction_metadata_by_id.get(&auction_id).unwrap();
        assert_eq!(
            owner_id, auction.host_id,
            "You do not have permission to delete"
        );
        self.auction_metadata_by_id.remove(&auction_id);
    }

    fn join_auction(&mut self, auction_id: AuctionId) {
        todo!()
    }
}
