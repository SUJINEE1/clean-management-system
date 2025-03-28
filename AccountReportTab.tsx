
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AccountReportTab() {
  const [accountReports, setAccountReports] = useState([]);
  const [accountInput, setAccountInput] = useState({
    신고번호: "",
    신고자이름: "",
    유효성검사: "적격",
    포상여부: "지급대상아님"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (field, value) => {
    setAccountInput(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdateReport = () => {
    if (!accountInput.신고번호 || !accountInput.신고자이름) {
      alert("신고번호와 신고자이름은 필수입니다.");
      return;
    }
    if (editIndex !== null) {
      const updated = [...accountReports];
      updated[editIndex] = accountInput;
      setAccountReports(updated);
      setEditIndex(null);
    } else {
      setAccountReports(prev => [...prev, accountInput]);
    }
    setAccountInput({ 신고번호: "", 신고자이름: "", 유효성검사: "적격", 포상여부: "지급대상아님" });
  };

  const handleEdit = (index) => {
    setAccountInput(accountReports[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = accountReports.filter((_, i) => i !== index);
    setAccountReports(updated);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setAccountReports(prev => [...prev, ...data]);
    };
    reader.readAsBinaryString(file);
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(accountReports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "계좌신고");
    XLSX.writeFile(workbook, "계좌신고_데이터.xlsx");
  };

  const filteredReports = accountReports.filter(r =>
    r.신고자이름?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = accountReports.length;
    const 지급완료 = accountReports.filter(r => r.포상여부 === "지급완료").length;
    const 지급대상아님 = accountReports.filter(r => r.포상여부 === "지급대상아님").length;
    const 적격 = accountReports.filter(r => r.유효성검사 === "적격").length;
    const 비적격 = accountReports.filter(r => r.유효성검사 === "비적격").length;
    return { total, 지급완료, 지급대상아님, 적격, 비적격 };
  }, [accountReports]);

  const pieData = useMemo(() => [
    { name: "적격", value: stats.적격 },
    { name: "비적격", value: stats.비적격 }
  ], [stats]);

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">🏦 계좌신고</h2>

      <div className="grid grid-cols-5 gap-4 text-center">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="bg-gray-100 rounded p-4">
            <div className="text-sm text-gray-600">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="신고번호" value={accountInput.신고번호} onChange={e => handleInputChange("신고번호", e.target.value)} />
        <Input placeholder="신고자이름" value={accountInput.신고자이름} onChange={e => handleInputChange("신고자이름", e.target.value)} />
        <Input placeholder="유효성검사" value={accountInput.유효성검사} onChange={e => handleInputChange("유효성검사", e.target.value)} />
        <Input placeholder="포상여부" value={accountInput.포상여부} onChange={e => handleInputChange("포상여부", e.target.value)} />
      </div>
      <div className="flex gap-4 items-center">
        <Button onClick={handleAddOrUpdateReport}>{editIndex !== null ? "수정" : "등록"}</Button>
        <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} />
        <Button onClick={handleExcelDownload} variant="outline">엑셀 다운로드</Button>
      </div>

      <div className="mt-6">
        <Input placeholder="신고자 이름 검색" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-2 w-64" />
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">신고번호</th>
              <th className="border p-2">신고자</th>
              <th className="border p-2">유효성검사</th>
              <th className="border p-2">포상여부</th>
              <th className="border p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="border p-2">{r.신고번호}</td>
                <td className="border p-2">{r.신고자이름}</td>
                <td className="border p-2">{r.유효성검사}</td>
                <td className="border p-2">{r.포상여부}</td>
                <td className="border p-2 space-x-2">
                  <Button size="sm" onClick={() => handleEdit(i)}>수정</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(i)}>삭제</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
