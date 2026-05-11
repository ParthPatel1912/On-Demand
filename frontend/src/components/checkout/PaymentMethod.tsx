import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  IPaymentGatewayValue,
  IPaymentMethodValue,
} from "@/types/service-checkout/serviceBooking.interface";
import { PAYMENT_GATEWAY_OPTIONS, PAYMENT_METHOD, PAYMENT_METHOD_OPTIONS } from "@/utils/constants";
import { CHECKOUT_CONST_TEXT } from "@/constants/checkout.text";

interface IProps {
  value: IPaymentMethodValue | null;
  gatewayValue: IPaymentGatewayValue | null;
  onSelect?: (
    method: IPaymentMethodValue,
    gateway: IPaymentGatewayValue | null
  ) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PaymentMethod = ({
  value,
  gatewayValue,
  onSelect,
  open,
  onOpenChange,
}: IProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";
  const effectiveOpen = isControlled ? open : internalOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange!(next);
    else setInternalOpen(next);
  };
  const [selected, setSelected] = useState<IPaymentMethodValue | null>(value);
  const [selectedGateway, setSelectedGateway] =
    useState<IPaymentGatewayValue | null>(gatewayValue);

  const handleSave = () => {
    if (selected) {
      if (selected.value === PAYMENT_METHOD.CARD && !selectedGateway) {
        return;
      }
      onSelect?.(selected, selectedGateway);
    }
    setOpen(false);
  };

  return (
    <div className="w-full">
      <Dialog open={effectiveOpen} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-xs sm:max-w-md rounded-xl p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6">
            <DialogTitle className="font-alexandria font-bold text-base leading-5.5 tracking-[0.0015em]">
              {CHECKOUT_CONST_TEXT.selectPaymentMethod}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pt-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHOD_OPTIONS.map((m) => {
                const active = m.value === selected?.value;
                return (
                  <Button
                    key={m.value}
                    variant="outline"
                    className={[
                      "rounded-full h-9 px-4 py-2 transition-colors bg-surface-neutral",
                      active
                        ? "border-primary text-primary bg-surface-faintAlt"
                        : "border-line text-ink hover:bg-surface-faint",
                    ].join(" ")}
                    onClick={() => {
                      setSelected(m);
                      if (m.value === PAYMENT_METHOD.CASH) {
                        setSelectedGateway(null);
                      }
                    }}
                  >
                    {m.title}
                  </Button>
                );
              })}
            </div>
          </div>

          {selected?.value === PAYMENT_METHOD.CARD && (
            <div className="px-6 pb-2 space-y-1">
              <p className="text-sm font-semibold ">Pay with</p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_GATEWAY_OPTIONS.map((m) => {
                  const active = m.value === selectedGateway?.value;
                  return (
                    <Button
                      key={m.value}
                      variant="outline"
                      className={[
                        "rounded-full h-9 px-4 py-2 transition-colors bg-surface-neutral",
                        active
                          ? "border-primary text-primary bg-surface-faintAlt"
                          : "border-line text-ink hover:bg-surface-faint",
                      ].join(" ")}
                      onClick={() => setSelectedGateway(m)}
                    >
                      {m.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="px-6 pb-6 gap-2">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              {CHECKOUT_CONST_TEXT.cancel}
            </Button>
            <Button
              className="rounded-full"
              onClick={handleSave}
              disabled={selected?.value === PAYMENT_METHOD.CARD && !selectedGateway}
            >
              {CHECKOUT_CONST_TEXT.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethod;
