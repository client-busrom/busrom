import { Button } from "@/components/ui/button";

export default function SuccessModal({
  isOpen,
  onClose,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-brand-main rounded-[30px] py-8 px-12 min-w-[400px] max-w-[90vw] mx-4 shadow-2xl border border-brand-accent-border flex items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 flex-shrink-0 bg-brand-secondary/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-brand-text-main font-anaheim text-lg font-medium leading-relaxed flex-1 whitespace-pre-line">
          {message}
        </p>

        <Button
          onClick={onClose}
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-brand-text-inverse font-anaheim font-semibold px-8 py-2 rounded-full text-base flex-shrink-0"
        >
          OK
        </Button>
      </div>
    </div>
  );
}
