import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import {Connection} from "@solana/web3.js";
import { Button, Col, Row, Table } from "antd";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { TokenIcon } from "../../components/TokenIcon";
import { useConnectionConfig } from "../../contexts/connection";
import { useMarkets } from "../../contexts/market";
import {useUserAccounts, useUserBalance, useUserTotalBalance} from "../../hooks";
import { WRAPPED_SOL_MINT } from "../../utils/ids";
import { formatUSD } from "../../utils/utils";
import {getTokenAccounts} from "../../larix-api/provider/tokenAccountsProvider";
import {useWallet} from "@solana/wallet-adapter-react";
import {getLendingReserve} from "../../larix-api/provider/lendingReserveProvider";
import {getLendingMarket} from "../../larix-api/provider/lendingMarketProvider";
import {getObligation, getObligations} from "../../larix-api/provider/obligationProvider";
import {getConnection} from "../../larix-api/context/connection";
import {TOKEN_PROGRAM_ID, AccountLayout} from "@solana/spl-token";
import * as anchor from '@project-serum/anchor'
import {Detail, LendingMarketParser, Reserve} from "../../larix-api/models";
import {LENDING_ID} from "../../larix-api/utils/ids";
import {useCollateralizedPosition} from "../../hooks/useCollateralizedPosition";
import {getMining} from "../../larix-api/provider/miningProvider";

export const HomeView = () => {
  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { endpoint } = useConnectionConfig();
  const SRM_ADDRESS = "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt";
  const SRM = useUserBalance(SRM_ADDRESS);
  const SOL = useUserBalance(WRAPPED_SOL_MINT);
  const { balanceInUSD: totalBalanceInUSD } = useUserTotalBalance();
  const { publicKey } = useWallet();
  const { collateralizedPositions } = useCollateralizedPosition(publicKey);

  const test = async () => {
    if (publicKey) {
      const userTokenAccounts = await getTokenAccounts(publicKey);
      // console.log("userTokenAccounts", userTokenAccounts);
      // let test = userTokenAccounts.get("ArWoXQYvvERzuoeGTpyyvf7pNNVEPB3x7kQg5W6zQdaB")
      // console.log(test)
      // const larixReserve = await getLendingReserve();
      // const larixLendingMarket = await getLendingMarket();
      // const larixMining = await getMining(publicKey);
      // console.log('larixMining', larixMining)
      // console.log("larixLending", larixLendingMarket);
      // console.log("larixReserve", larixReserve)
      // const reserves: Detail<Reserve>[] = []
      // larixReserve.forEach(acc => {
      //   if (userTokenAccounts.has(acc.info.liquidity.mintPubkey.toString())){
      //     const tokenAcc = userTokenAccounts.get(acc.info.liquidity.mintPubkey.toString());
      //     if (tokenAcc) {
      //       console.log("user t acc", tokenAcc[0].pubkey.toString(), tokenAcc)
      //       console.log(tokenAcc[0].info.amount.toString())
      //     }
      //     console.log("got here", acc.info.liquidity.mintPubkey.toString(), acc)


          // console.log("mintKey liquid", acc.info.liquidity.mintPubkey.toString())
          // console.log("supplyKey liquid",acc.info.liquidity.supplyPubkey.toString())
          //
          // console.log("mintKey collat", acc.info.collateral.mintPubkey.toString())
          // console.log("supplyKey collat",acc.info.collateral.supplyPubkey.toString())
          // console.log("availableAmount", acc.info.liquidity.availableAmount.toString())
          // reserves.push(acc)
        // }
      // });
    }
  }

  useEffect(() => {
    test()
  }, [publicKey])


  const dataSource = [
    {
      platform: 'test',
      mint: 'test',
      supplied: false,
      amount: 20,
      borrowApy: 20,
      depositApy: 20,
    },
  ];

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: 'Mint',
      dataIndex: 'mint',
      key: 'mint',
    },
    {
      title: 'Supplied',
      dataIndex: 'supplied',
      key: 'supplied',
      render: (supplied: boolean) => supplied ? "Yes" : "No",
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Borrow Apy',
      dataIndex: 'borrowApy',
      key: 'borrowApy',
    },
    {
      title: 'Deposit Apy',
      dataIndex: 'depositApy',
      key: 'depositApy',
    },
  ];

  return (
    <Row gutter={[16, 16]} align="middle">
      <Col span={24}>
        <Table dataSource={collateralizedPositions} columns={columns} />
      </Col>
    </Row>
  );
};
