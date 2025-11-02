import { useState } from "react";
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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".csv")) {
      setFile(selected);
      setError("");
    } else {
      setError("Please select a valid CSV file");
    }
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
      onOpenChange(false);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload CSV Expenses</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns:{" "}
            <code>date, amount, type, category, description</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {file && (
            <div className="flex items-center text-sm text-green-600">
              <FileText className="w-4 h-4 mr-1" />
              {file.name}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Alert className="text-xs">
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
