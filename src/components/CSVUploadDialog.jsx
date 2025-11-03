// import { useState } from "react";
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

//   const handleFileChange = (e) => {
//     const selected = e.target.files[0];
//     if (selected && selected.name.endsWith(".csv")) {
//       setFile(selected);
//       setError("");
//     } else {
//       setError("Please select a valid CSV file");
//     }
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
//       onOpenChange(false);
//       setFile(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Upload CSV Expenses</DialogTitle>
//           <DialogDescription>
//             Upload a CSV file with columns:{" "}
//             <code>date, amount, type, category, description</code>
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           <Input
//             type="file"
//             accept=".csv"
//             onChange={handleFileChange}
//             disabled={uploading}
//           />
//           {file && (
//             <div className="flex items-center text-sm text-green-600">
//               <FileText className="w-4 h-4 mr-1" />
//               {file.name}
//             </div>
//           )}
//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           <Alert className="text-xs">
//             <AlertDescription>
//               <strong>CSV Format:</strong>
//               <br />
//               date,amount,type,category,description
//               <br />
//               2025-04-01,500,credit,Salary,Monthly pay
//               <br />
//               2025-04-02,150,debit,Food,Lunch
//             </AlertDescription>
//           </Alert>
//         </div>

//         <DialogFooter>
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
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
import { Upload, FileText } from "lucide-react";

export default function CSVUploadDialog({ open, onOpenChange, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const dropRef = useRef(null);

  const validateFile = (selected) => {
    if (
      selected &&
      (selected.type === "text/csv" || selected.name.endsWith(".csv"))
    ) {
      setFile(selected);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid CSV file");
    }
  };

  const handleFileChange = (e) => {
    validateFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
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
      const result = await personalExpenseService.uploadCSV(file);
      onSuccess(result);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload CSV Expenses</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns:{" "}
            <code>date, amount, type, category, description</code>
          </DialogDescription>
        </DialogHeader>

        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-gray-500 transition"
        >
          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-500" />
          <p className="text-gray-700">
            Drag & drop your CSV file here, or click to select
          </p>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center text-sm text-green-600 mt-2">
            <FileText className="w-4 h-4 mr-1" />
            {file.name}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="text-xs mt-2">
          <AlertDescription>
            <strong>CSV Format:</strong>
            <br />
            date,amount,type,category,description
            <br />
            2025-04-01,500,credit,Salary,Monthly pay
            <br />
            2025-04-02,150,debit,Food,Lunch
          </AlertDescription>
        </Alert>

        <DialogFooter>
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
            className="cursor-pointer"
            disabled={!file || uploading}
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
