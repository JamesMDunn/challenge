import { Col, Row, Table } from "antd";
import React from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {useCollateralizedPosition} from "../../hooks/useCollateralizedPosition";

export const HomeView = () => {
  const { publicKey } = useWallet();
  const { collateralizedPositions } = useCollateralizedPosition(publicKey);


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
      render: (borrowApy: string) => borrowApy + "%",
    },
    {
      title: 'Deposit Apy',
      dataIndex: 'depositApy',
      key: 'depositApy',
      render: (depositApy: boolean) => depositApy + "%",
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
