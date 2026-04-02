import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Canvas as FabricCanvas, PencilBrush, Rect, Circle, IText } from "fabric";
import { 
  Download, 
  Mail, 
  Printer, 
  Pen, 
  Eraser, 
  Square, 
  Circle as CircleIcon, 
  Type,
  Undo,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface PetRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  veterinarian: string;
  petName: string;
  ownerName: string;
  fileUrl: string;
  notes?: string[];
}

interface PetRecordsViewerProps {
  record: PetRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PetRecordsViewer = ({ record, isOpen, onClose }: PetRecordsViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "erase" | "text" | "rectangle" | "circle">("select");
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [brushWidth, setBrushWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 1000,
      backgroundColor: "transparent",
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushWidth;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [isOpen, brushColor, brushWidth]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth;
    }
  }, [activeTool, brushColor, brushWidth, fabricCanvas]);

  useEffect(() => {
    if (record?.notes) {
      setNotes(record.notes);
    }
  }, [record]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (tool === "rectangle" && fabricCanvas) {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: brushColor,
        strokeWidth: brushWidth,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
    } else if (tool === "circle" && fabricCanvas) {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: brushColor,
        strokeWidth: brushWidth,
        radius: 50,
      });
      fabricCanvas.add(circle);
    } else if (tool === "text" && fabricCanvas) {
      const text = new IText("Add text here", {
        left: 100,
        top: 100,
        fill: brushColor,
        fontSize: 16,
      });
      fabricCanvas.add(text);
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? zoom * 1.2 : zoom / 1.2;
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
    fabricCanvas?.setZoom(newZoom);
    fabricCanvas?.renderAll();
  };

  const handleUndo = () => {
    const objects = fabricCanvas?.getObjects();
    if (objects && objects.length > 0) {
      fabricCanvas?.remove(objects[objects.length - 1]);
    }
  };

  const handleClearAnnotations = () => {
    fabricCanvas?.clear();
    toast("Annotations cleared");
  };

  const handlePrint = () => {
    window.print();
    toast("Preparing document for printing...");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Pet Record: ${record?.petName} - ${record?.title}`);
    const body = encodeURIComponent(`Please find attached the pet record for ${record?.petName}.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleDownload = () => {
    if (record?.fileUrl) {
      const link = document.createElement("a");
      link.href = record.fileUrl;
      link.download = `${record.petName}-${record.title}.pdf`;
      link.click();
      toast("Download started");
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote("");
      toast("Note added successfully");
    }
  };

  const handleDeleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
    toast("Note deleted");
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{record.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Badge variant="outline">{record.type}</Badge>
                <span>•</span>
                <span>{record.petName}</span>
                <span>•</span>
                <span>{record.ownerName}</span>
                <span>•</span>
                <span>{record.date}</span>
                <span>•</span>
                <span>Dr. {record.veterinarian}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer with Annotations */}
          <div className="flex-1 flex flex-col">
            {/* Annotation Toolbar */}
            <div className="border-b p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    variant={activeTool === "select" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTool("select")}
                  >
                    <span className="text-xs">Select</span>
                  </Button>
                  <Button
                    variant={activeTool === "draw" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTool("draw")}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeTool === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToolClick("text")}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeTool === "rectangle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToolClick("rectangle")}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeTool === "circle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToolClick("circle")}
                  >
                    <CircleIcon className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={brushWidth}
                    onChange={(e) => setBrushWidth(Number(e.target.value))}
                    className="w-20"
                  />
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleZoom("in")}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleZoom("out")}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={handleUndo}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearAnnotations}>
                    <Eraser className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* PDF Viewer Area */}
            <div className="flex-1 relative overflow-auto bg-gray-50 p-4">
              <div className="relative bg-white shadow-lg mx-auto" style={{ width: "800px", minHeight: "1000px" }}>
                {/* Placeholder for PDF content */}
                <div className="absolute inset-0 bg-white border flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">PDF content will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">{record.title}</p>
                  </div>
                </div>
                {/* Annotation Canvas Overlay */}
                <canvas 
                  ref={canvasRef}
                  className="absolute inset-0 z-10"
                  style={{ pointerEvents: activeTool !== "select" ? "auto" : "none" }}
                />
              </div>
            </div>
          </div>

          {/* Notes Panel */}
          <div className="w-80 border-l bg-background">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-4">Notes & Annotations</h3>
              
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddNote}
                    className="mt-2 w-full"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[500px] p-4">
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm flex-1">{note}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(index)}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date().toLocaleDateString()} • Dr. Smith
                    </p>
                  </Card>
                ))}
                
                {notes.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes added yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};