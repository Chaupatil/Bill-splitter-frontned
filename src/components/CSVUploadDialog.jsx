// import { useState, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Upload, FileText } from "lucide-react";

// export default function CSVUploadDialog({ open, onOpenChange, onSuccess }) {
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState("");
//   const dropRef = useRef(null);

//   const validateFile = (selected) => {
//     if (
//       selected &&
//       (selected.type === "text/csv" || selected.name.endsWith(".csv"))
//     ) {
//       setFile(selected);
//       setError("");
//     } else {
//       setFile(null);
//       setError("Please select a valid CSV file");
//     }
//   };

//   const handleFileChange = (e) => {
//     validateFile(e.target.files[0]);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       validateFile(e.dataTransfer.files[0]);
//       e.dataTransfer.clearData();
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     setUploading(true);
//     try {
//       const { personalExpenseService } = await import(
//         "../services/personalExpenseService"
//       );
//       const result = await personalExpenseService.uploadCSV(file);
//       onSuccess(result);
//       handleClose();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleClose = () => {
//     setFile(null);
//     setError("");
//     setUploading(false);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Upload CSV Expenses</DialogTitle>
//           <DialogDescription>
//             Upload a CSV file with columns:{" "}
//             <code>date, amount, type, category, description</code>
//           </DialogDescription>
//         </DialogHeader>

//         <div
//           ref={dropRef}
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//           className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-gray-500 transition"
//         >
//           <Upload className="w-6 h-6 mx-auto mb-2 text-gray-500" />
//           <p className="text-gray-700">
//             Drag & drop your CSV file here, or click to select
//           </p>
//           <Input
//             type="file"
//             accept=".csv"
//             onChange={handleFileChange}
//             disabled={uploading}
//             className="hidden"
//           />
//         </div>

//         {file && (
//           <div className="flex items-center text-sm text-green-600 mt-2">
//             <FileText className="w-4 h-4 mr-1" />
//             {file.name}
//           </div>
//         )}

//         {error && (
//           <Alert variant="destructive" className="mt-2">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         <Alert className="text-xs mt-2">
//           <AlertDescription>
//             <strong>CSV Format:</strong>
//             <br />
//             date,amount,type,category,description
//             <br />
//             2025-04-01,500,credit,Salary,Monthly pay
//             <br />
//             2025-04-02,150,debit,Food,Lunch
//           </AlertDescription>
//         </Alert>

//         <DialogFooter>
//           <Button
//             variant="outline"
//             onClick={handleClose}
//             disabled={uploading}
//             className="cursor-pointer"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleUpload}
//             className="cursor-pointer"
//             disabled={!file || uploading}
//           >
//             {uploading ? (
//               "Uploading..."
//             ) : (
//               <>
//                 <Upload className="w-4 h-4 mr-2" /> Upload
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X } from "lucide-react";
import * as XLSX from "xlsx"; // <-- NEW

export default function CSVUploadDialog({ open, onOpenChange, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]); // first 5 rows
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  /** --------------------------------------------------------------
   *  Validate + read preview (CSV or Excel)
   *  -------------------------------------------------------------- */
  const processFile = async (selected) => {
    const valid =
      selected.type === "text/csv" ||
      selected.name.endsWith(".csv") ||
      selected.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      selected.type === "application/vnd.ms-excel" ||
      selected.name.endsWith(".xlsx") ||
      selected.name.endsWith(".xls");

    if (!valid) {
      setError("Please select a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    setFile(selected);
    setError("");

    // ----- preview -----
    if (selected.name.endsWith(".csv")) {
      const text = await selected.text();
      const rows = text
        .split("\n")
        .filter((r) => r.trim())
        .slice(0, 6); // header + 5 rows
      setPreview(rows.map((r) => r.split(",")));
    } else {
      // Excel
      const ab = await selected.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setPreview(json.slice(0, 6));
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { personalExpenseService } = await import(
        "../services/personalExpenseService"
      );
      const result = await personalExpenseService.uploadFile(file); // <-- renamed
      onSuccess(result);
      handleClose();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setPreview([]);
    setUploading(false);
    onOpenChange(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Expenses (CSV / Excel)</DialogTitle>
          <DialogDescription>
            Supported formats: <code>.csv</code>, <code>.xlsx</code>,{" "}
            <code>.xls</code>
            <br />
            Columns (first row is header):{" "}
            <code>date, amount, type, category, description</code>
          </DialogDescription>
        </DialogHeader>

        {/* ---- Drop zone ---- */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-gray-500 transition"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
          <p className="text-gray-700">
            Drag & drop a file here, or <span className="underline">click</span>{" "}
            to select
          </p>
          <Input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {/* ---- Selected file ---- */}
        {file && (
          <div className="flex items-center justify-between mt-2 p-2 bg-gray-50 rounded">
            <div className="flex items-center text-sm text-green-600">
              <FileText className="w-4 h-4 mr-1" />
              {file.name}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFile(null);
                setPreview([]);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ---- Preview table ---- */}
        {preview.length > 0 && (
          <div className="mt-4 max-h-48 overflow-auto">
            <p className="text-sm font-medium mb-1">Preview (first 5 rows)</p>
            <table className="w-full text-xs border">
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className={i === 0 ? "bg-gray-100" : ""}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border px-2 py-1 truncate max-w-xs"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---- Error ---- */}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ---- Format hint ---- */}
        <Alert className="text-xs mt-3">
          <AlertDescription>
            <strong>Required CSV/Excel columns:</strong>
            <br />
            date,amount,type,category,description
            <br />
            <em>Example row:</em> 2025-04-01,500,credit,Salary,Monthly pay
          </AlertDescription>
        </Alert>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="cursor-pointer"
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
