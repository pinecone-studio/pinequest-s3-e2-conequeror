"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormulaKeyboardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string) => void;
  initialLatex?: string;
  title?: string;
};

const quickInsertSnippets = [
  { label: "x²", value: "x^2" },
  { label: "√x", value: "\\sqrt{x}" },
  { label: "a/b", value: "\\frac{a}{b}" },
  { label: "π", value: "\\pi" },
  { label: "∑", value: "\\sum_{i=1}^{n}" },
  { label: "∫", value: "\\int_a^b" },
] as const;

export function FormulaKeyboardDialog({
  open,
  onOpenChange,
  onInsert,
  initialLatex = "",
  title = "Томьёоны keyboard",
}: FormulaKeyboardDialogProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [latexValue, setLatexValue] = useState(initialLatex);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLatexValue(initialLatex);

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [initialLatex, open]);

  const handleInsertSnippet = (snippet: string) => {
    const input = inputRef.current;

    if (!input) {
      setLatexValue((current) => `${current}${snippet}`);
      return;
    }

    const selectionStart = input.selectionStart ?? latexValue.length;
    const selectionEnd = input.selectionEnd ?? latexValue.length;
    const nextValue =
      latexValue.slice(0, selectionStart) +
      snippet +
      latexValue.slice(selectionEnd);

    setLatexValue(nextValue);

    requestAnimationFrame(() => {
      input.focus();
      const caretPosition = selectionStart + snippet.length;
      input.setSelectionRange(caretPosition, caretPosition);
    });
  };

  const handleConfirm = () => {
    const value = latexValue.trim();

    if (!value) {
      return;
    }

    onInsert(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] rounded-[24px] border border-[#E8E2F1] bg-white p-0 shadow-[0_24px_80px_rgba(32,18,72,0.18)]">
        <DialogHeader className="border-b border-[#F0EBFA] px-6 py-5">
          <DialogTitle className="text-[24px] font-semibold tracking-tight text-[#16111D]">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {quickInsertSnippets.map((snippet) => (
              <button
                key={snippet.label}
                type="button"
                onClick={() => handleInsertSnippet(snippet.value)}
                className="rounded-[14px] border border-[#E8E2F1] bg-[#FAF8FE] px-3 py-3 text-[15px] font-medium text-[#3A3247] transition hover:border-[#B59AF8] hover:bg-white"
              >
                {snippet.label}
              </button>
            ))}
          </div>

          <div className="rounded-[20px] border border-[#E8E2F1] bg-[#FBFAFE] p-4">
            <textarea
              ref={inputRef}
              value={latexValue}
              onChange={(event) => setLatexValue(event.target.value)}
              placeholder="Жишээ: \\frac{a}{b}, x^2, \\sqrt{x}"
              className="min-h-[120px] w-full resize-none rounded-[16px] border border-[#DCD3F1] bg-white px-4 py-4 text-[18px] text-[#1A1623] outline-none transition focus:border-[#B59AF8] focus:ring-4 focus:ring-[#B59AF8]/15"
            />
            <p className="mt-3 text-[13px] text-[#7C7688]">
              `mathlive` суулгагдаагүй үед энэ fallback editor ажиллана.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#F0EBFA] px-6 py-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full px-6"
            onClick={() => onOpenChange(false)}
          >
            Болих
          </Button>
          <Button
            type="button"
            className="h-11 rounded-full bg-[#9c7cf7] px-6 text-white hover:bg-[#8f6df5]"
            onClick={handleConfirm}
          >
            Оруулах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
