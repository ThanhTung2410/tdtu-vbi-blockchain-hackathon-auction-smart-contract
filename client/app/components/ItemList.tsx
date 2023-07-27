"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Item } from "../@types/Item.type";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Modal from "./Modal";
import { useAppSelector } from "@/context/store";
import {
  selectAccountId,
  selectIsLoading,
  selectWallet,
} from "@/features/walletSlice";
import Title from "./Title";
import { Router } from "next/router";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_NAME || "";

const Cards = styled.div`
  display: flex;
  gap: 1.4rem;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 4rem;
`;

const Card = styled.div`
  width: 25%;
  min-width: 250px;
  display: flex;
  flex-flow: column nowrap;
  -ms-flex-flow: column nowrap;
  align-items: center;
  //  background-color:#09011a;
  border-radius: 10px;
  border: 1.41429px solid rgba(28, 27, 28, 0.1);
  box-shadow: 5.65714px 5.65714px 11.3143px rgba(28, 27, 28, 0.04);
  padding: 8px;
  //  color: #fff;
  margin: 0 auto;
  max-width: 400px;
  flex: 1;
  &:hover img {
    transform: scale(1.05);
  }
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
  }
`;

const CardHeading = styled.h5`
  font-size: 1.25rem;
  font-weght: 500;
  color: #09011a;
`;

const Text = styled.div`
  opacity: 0.6;
`;

const ImageCard = styled.div`
  height: 200px;
  width: 100%;
  border-radius: inherit;
  overflow: hidden;
  margin-bottom: 0.5rem;
  & > img {
    object-fit: cover;
    transition: all 0.3s ease-in-out;
  }
  & > img:hover {
    transform: scale(1.05);
  }
`;

interface ItemListProps {
  items: Item[];
  setItems: Dispatch<SetStateAction<Item[]>>;
}

export default function ItemList(props: ItemListProps) {
  const { items, setItems } = props;
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const wallet = useAppSelector(selectWallet);
  const account = useAppSelector(selectAccountId);
  const [walletReady, setWalletready] = useState(false);
  const isLoading = useAppSelector(selectIsLoading);

  useEffect(() => {
    if (!isLoading && wallet) {
      setWalletready(true);
    }
  }, [isLoading, wallet]);

  const finishDeleteItem = async (e: any) => {
    if (!wallet) {
      console.error("Wallet is not initialized");
      return;
    }
    setWalletready(false);
    e.preventDefault();

    await wallet
      .callMethod({
        contractId: CONTRACT_ID,
        method: "delete_item",
        args: { item_id: currentItem?.item_id },
        gas: "300000000000000",
      })
      .then(() => setWalletready(true))
      .then(() => setCurrentItem(null))
      .then(() => {
        window.location.reload();
      });
  };

  const startDeleteItem = (itemId: number) => {
    let itemFound = items.find((item) => item.item_id === itemId);
    if (itemFound) {
      setCurrentItem(itemFound);
    }
    setIsShowModal(true);
  };

  const router = useRouter();

  return (
    <>
      <Title name="Your Inventory" />
      <Cards>
        {items.map((item) => (
          <Card key={item.item_id}>
            <ImageCard>
              <a href="" target="_blank" rel="noopener noreferrer">
                <img src={item.media} alt="..." />
              </a>
            </ImageCard>
            <div className="card-body p-2 mt-3">
              <CardHeading>{item.name}</CardHeading>
              <Text className="ps-2  pb-3 text-secondary">
                {item.description}
              </Text>
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Auction
            </button>
            <button
              onClick={() => {
                startDeleteItem(item.item_id);
              }}
              className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => {
                router.push("/items/edit?id=" + item.item_id);
              }}
            >
              Edit
            </button>
          </Card>
        ))}
      </Cards>
      <Modal
        isShowModal={isShowModal}
        setIsShowModal={setIsShowModal}
        finishDeleteItem={finishDeleteItem}
      />
    </>
  );
}
