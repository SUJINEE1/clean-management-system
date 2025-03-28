
import React, { useState } from "react";
import SiteReportTab from "../components/SiteReportTab";
import AccountReportTab from "../components/AccountReportTab";
import RewardReportTab from "../components/RewardReportTab";
import ReporterManagementTab from "../components/ReporterManagementTab";

export default function Home() {
  const [tab, setTab] = useState("사이트신고");

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>신고 관리 시스템</h1>
      <div style={{ marginBottom: 20 }}>
        {["사이트신고", "포상관리", "계좌신고", "신고인관리"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              marginRight: 10,
              padding: "8px 16px",
              backgroundColor: tab === t ? "#0070f3" : "#eaeaea",
              color: tab === t ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "사이트신고" && <SiteReportTab />}
      {tab === "포상관리" && <RewardReportTab />}
      {tab === "계좌신고" && <AccountReportTab />}
      {tab === "신고인관리" && <ReporterManagementTab />}
    </div>
  );
}
