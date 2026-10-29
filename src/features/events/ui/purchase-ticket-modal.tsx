import { useState } from "react";
import type { Event } from "../actions/use-events";
import { usePurchaseTicket } from "../actions/use-purchase-ticket";
import { Button } from "../../shared/ui/button";
import { X, Minus, Plus } from "lucide-react";

interface PurchaseTicketModalProps {
  event: Event;
  onClose: () => void;
}

const PurchaseTicketModal = ({ event, onClose }: PurchaseTicketModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTicket, setSelectedTicket] = useState<number>(0);
  const [ticketCount, setTicketCount] = useState<number>(1);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const { mutate: purchaseTickets, isPending } = usePurchaseTicket();

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!guestName.trim()) newErrors.name = "Name is required";
    if (!guestEmail.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(guestEmail))
      newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const currentTicket = event.tickets[selectedTicket];
  const totalPrice = currentTicket ? currentTicket.price * ticketCount : 0;

  const handleTicketSelect = (idx: number) => {
    setSelectedTicket(idx);
    setTicketCount(1); // Reset count when switching tickets
  };

  const handleDecrease = () => {
    if (ticketCount > 1) setTicketCount(ticketCount - 1);
  };

  const handleIncrease = () => {
    const maxAvailable = currentTicket?.availableQuantity ?? 10;
    if (ticketCount < maxAvailable) setTicketCount(ticketCount + 1);
  };

  const handlePurchase = () => {
    if (!validate()) return;

    purchaseTickets(
      {
        eventId: event._id,
        ticketId: currentTicket._id,
        quantity: ticketCount,
        fullName: guestName,
        email: guestEmail,
      },
      {
        onSuccess: (data) => {
          console.log("Payment response:", data.payment);
          if (data.payment.data.authorization_url) {
            window.location.href = data.payment.data.authorization_url;
          }
          onClose();
        },
        onError: (error) => {
          console.error("Purchase failed:", error);
          alert("Failed to initiate purchase. Please try again.");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-tickets-title"
        className="bg-white w-full max-w-lg  shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3
            id="purchase-tickets-title"
            className="font-marcellus text-2xl text-gray-900"
          >
            Purchase Tickets
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {event.tickets.length > 0 ? (
            <>
              {step === 1 ? (
                // Step 1: Select Ticket & Quantity
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">
                      SELECT TICKET TYPE
                    </h4>
                    <div className="space-y-3">
                      {event.tickets.map((ticket, idx) => (
                        <button
                          key={idx}
                          disabled={ticket.availableQuantity === 0}
                          onClick={() => handleTicketSelect(idx)}
                          className={`w-full flex justify-between items-center p-4 border transition-all text-left ${
                            ticket.availableQuantity === 0
                              ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                              : selectedTicket === idx
                                ? "border-primary bg-red-50/30"
                                : "border-gray-200 hover:border-gray-300 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                ticket.availableQuantity === 0
                                  ? "border-gray-200"
                                  : selectedTicket === idx
                                    ? "border-primary"
                                    : "border-gray-300"
                              }`}
                            >
                              {ticket.availableQuantity !== 0 &&
                                selectedTicket === idx && (
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                )}
                            </div>
                            <span
                              className={`text-sm font-bold ${ticket.availableQuantity === 0 ? "text-gray-400" : "text-gray-900"}`}
                            >
                              {ticket.type}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-marcellus text-lg ${ticket.availableQuantity === 0 ? "text-gray-300" : "text-primary"}`}
                            >
                              GHS{ticket.price}
                            </span>
                            {ticket.availableQuantity !== null &&
                              ticket.availableQuantity !== undefined && (
                                <span
                                  className={`text-[9px] uppercase font-bold tracking-tighter ${ticket.availableQuantity === 0 ? "text-red-400" : "text-gray-400"}`}
                                >
                                  {ticket.availableQuantity === 0
                                    ? "SOLD OUT"
                                    : `${ticket.availableQuantity} LEFT`}
                                </span>
                              )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                        SELECT QUANTITY
                      </h4>
                      {currentTicket?.availableQuantity !== null &&
                        currentTicket?.availableQuantity !== undefined && (
                          <span className="text-[10px] font-bold tracking-widest text-primary uppercase animate-in fade-in slide-in-from-right-1 duration-300">
                            {currentTicket.availableQuantity}{" "}
                            {currentTicket.availableQuantity === 1
                              ? "TICKET"
                              : "TICKETS"}{" "}
                            AVAILABLE
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleDecrease}
                        aria-label="Decrease quantity"
                        className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="w-12 text-center font-bold text-gray-900 text-lg">
                        {ticketCount}
                      </div>
                      <button
                        onClick={handleIncrease}
                        aria-label="Increase quantity"
                        className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-sm font-bold text-gray-500 uppercase">
                        TOTAL AMOUNT
                      </span>
                      <span className="text-3xl font-marcellus text-gray-900">
                        GHS{totalPrice}
                      </span>
                    </div>
                    <Button
                      onClick={() => setStep(2)}
                      variant="primary"
                      className="w-full bg-black hover:bg-gray-800 text-white px-6 py-4 text-[11px] font-bold tracking-widest rounded-none border-none shadow-none"
                    >
                      NEXT STEP
                    </Button>
                  </div>
                </div>
              ) : (
                // Step 2: User Details & Payment
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-gray-50 p-4 border border-gray-100 flex justify-between items-center">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                        TICKET SUMMARY
                      </h4>
                      <p className="font-bold text-gray-900 text-sm">
                        {ticketCount} x {currentTicket.type} Ticket
                        {ticketCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                        TOTAL
                      </h4>
                      <p className="font-marcellus text-xl text-primary font-bold">
                        GHS{totalPrice}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">
                      YOUR DETAILS
                    </h4>
                    <div className="grid gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="FULL NAME"
                          className={`w-full p-3 text-sm border ${
                            errors.name ? "border-red-500" : "border-gray-200"
                          } focus:outline-none focus:border-gray-900 transition-colors`}
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                        {errors.name && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="EMAIL ADDRESS"
                          className={`w-full p-3 text-sm border ${
                            errors.email ? "border-red-500" : "border-gray-200"
                          } focus:outline-none focus:border-gray-900 transition-colors`}
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                        {errors.email && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="w-1/3 bg-transparent border-gray-200 hover:bg-gray-50 text-gray-900 px-6 py-4 text-[11px] font-bold tracking-widest rounded-none shadow-none"
                    >
                      BACK
                    </Button>
                    <Button
                      onClick={handlePurchase}
                      disabled={isPending}
                      variant="primary"
                      className="w-2/3 bg-[#2A2E33] hover:bg-black text-white px-6 py-4 text-[11px] font-bold tracking-widest rounded-none border-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? "PROCESSING..." : "PROCEED TO PAYMENT"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 space-y-6">
              <div className="bg-gray-50 p-6 border border-gray-100 text-center">
                <p className="text-sm text-gray-600 font-manrope leading-relaxed">
                  This is a <strong>free event</strong>. No payment is required,
                  but please register your interest so we can manage capacity.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
                    NUMBER OF GUESTS
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDecrease}
                      aria-label="Decrease quantity"
                      className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-12 text-center font-bold text-gray-900 text-lg">
                      {ticketCount}
                    </div>
                    <button
                      onClick={handleIncrease}
                      aria-label="Increase quantity"
                      className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  alert(`Successfully registered for ${ticketCount} guest(s)!`);
                  onClose();
                }}
                variant="primary"
                className="w-full bg-primary hover:opacity-90 text-white px-6 py-5 text-[11px] font-bold tracking-widest rounded-none border-none shadow-none"
              >
                CONFIRM REGISTRATION
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicketModal;
