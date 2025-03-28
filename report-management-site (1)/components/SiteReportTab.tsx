
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SiteReportTab() {
  const [siteReports, setSiteReports] = useState([]);
  const [siteInput, setSiteInput] = useState({
    신고번호: "",
    신고자이름: "",
    신고사이트: "",
    처리상태: "확인중"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (field, value) => {
    setSiteInput(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdate = () => {
    if (!siteInput.신고번호 || !siteInput.신고자이름) {
      alert("신고번호와 신고자이름은 필수입니다.");
      return;
    }
    if (editIndex !== null) {
      const updated = [...siteReports];
      updated[editIndex] = siteInput;
      setSiteReports(updated);
      setEditIndex(null);
    } else {
      setSiteReports(prev => [...prev, siteInput]);
    }
    setSiteInput({ 신고번호: "", 신고자이름: "", 신고사이트: "", 처리상태: "확인중" });
  };

  const handleEdit = (index) => {
    setSiteInput(siteReports[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = siteReports.filter((_, i) => i !== index);
    setSiteReports(updated);
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
      setSiteReports(prev => [...prev, ...data]);
    };
    reader.readAsBinaryString(file);
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(siteReports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "사이트신고");
    XLSX.writeFile(workbook, "사이트신고_데이터.xlsx");
  };

  const filteredReports = siteReports.filter(r =>
    r.신고자이름?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = siteReports.length;
    const 처리완료 = siteReports.filter(r => r.처리상태 === "처리완료").length;
    const 확인중 = siteReports.filter(r => r.처리상태 === "확인중").length;
    const 심의중 = siteReports.filter(r => r.처리상태 === "심의중").length;
    return { total, 처리완료, 확인중, 심의중 };
  }, [siteReports]);

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">📄 사이트신고</h2>

      <div className="grid grid-cols-4 gap-4 text-center">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="bg-gray-100 rounded p-4">
            <div className="text-sm text-gray-600">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="신고번호" value={siteInput.신고번호} onChange={e => handleInputChange("신고번호", e.target.value)} />
        <Input placeholder="신고자이름" value={siteInput.신고자이름} onChange={e => handleInputChange("신고자이름", e.target.value)} />
        <Input placeholder="신고사이트" value={siteInput.신고사이트} onChange={e => handleInputChange("신고사이트", e.target.value)} />
        <Input placeholder="처리상태" value={siteInput.처리상태} onChange={e => handleInputChange("처리상태", e.target.value)} />
      </div>
      <div className="flex gap-4 items-center">
        <Button onClick={handleAddOrUpdate}>{editIndex !== null ? "수정" : "등록"}</Button>
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
              <th className="border p-2">사이트</th>
              <th className="border p-2">처리상태</th>
              <th className="border p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="border p-2">{r.신고번호}</td>
                <td className="border p-2">{r.신고자이름}</td>
                <td className="border p-2">{r.신고사이트}</td>
                <td className="border p-2">{r.처리상태}</td>
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
