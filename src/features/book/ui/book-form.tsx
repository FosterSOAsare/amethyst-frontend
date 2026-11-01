import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Bed, Utensils, ChevronDown } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { rooms } from "../../rooms/data/rooms";
import { roomInstances } from "../../rooms/data/room-instances";
import { diningAreas, tableInstances } from "../data/tables";

import { bookingSchema, type BookingFormData } from "../schema/booking-schema";
import { BookingCalendar } from "./booking-calendar";
import { BookingTimePicker } from "./booking-time-picker";
import { BookingUserDetails } from "./booking-user-details";
import { BookingSuccessModal } from "./booking-success-modal";
import { useCreateBooking } from "../actions/use-create-booking";
import { useCheckAvailability } from "../actions/use-check-availability";
import { motion } from "framer-motion";

const BookForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from search params
  const initialType = (searchParams.get("type") as "room" | "dining") || "room";
  const initialItemType =
    searchParams.get("itemType") ||
    (initialType === "room" ? rooms[0]?.id : diningAreas[0]?.id) ||
    "rm_01";
  const initialItem = searchParams.get("item") || "";

  const [formData, setFormData] = useState<BookingFormData>({
    type: initialType,
    itemType: initialItemType,
    item: initialItem,
    guests: 2,
    firstName: "",
    lastName: "",
    email: "",
    checkIn: undefined,
    checkOut: undefined,
  } as unknown as BookingFormData);

  // Separate state for internal dining selection helpers
  const [diningSelection, setDiningSelection] = useState<{
    diningDate?: string;
    arrivalHour?: number;
    departureHour?: number;
  }>({});

  // Sync search params with form data
  useEffect(() => {
    const params: any = {};
    if (formData.type) params.type = formData.type;
    if (formData.itemType) params.itemType = formData.itemType;
    if (formData.item) params.item = formData.item;

    // Check if params actually changed to avoid infinite loop or unnecessary history entries
    const currentParams = Object.fromEntries(searchParams.entries());
    const hasChanged =
      Object.keys(params).length !== Object.keys(currentParams).length ||
      Object.entries(params).some(
        ([key, value]) => String(value) !== currentParams[key],
      );

    if (hasChanged) {
      setSearchParams(params, { replace: true });
    }
  }, [
    formData.type,
    formData.itemType,
    formData.item,
    setSearchParams,
    searchParams,
  ]);

  const [errors, setErrors] = useState<any>({});
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const { mutateAsync: createBooking, isPending: isSubmitting } =
    useCreateBooking();

  const { type: activeTab, itemType, item, guests } = formData;

  const checkIn = activeTab === "room" ? formData.checkIn : undefined;
  const checkOut = activeTab === "room" ? formData.checkOut : undefined;
  const { diningDate, arrivalHour, departureHour } = diningSelection;

  const {
    data: availabilityData,
    isLoading: isCheckingAvailability,
    error: availabilityError,
  } = useCheckAvailability({
    type: activeTab,
    item,
  });
  const validate = () => {
    // Merge dining selection into a temporary object for validation
    const validationData = {
      ...formData,
      ...(activeTab === "dining" ? diningSelection : {}),
    };

    const result = bookingSchema.safeParse(validationData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = { message: issue.message };
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    updateField(name, value);

    // Clear dining selection when table changes
    if (name === "item" && activeTab === "dining") {
      setDiningSelection({});
    }
  };

  // Sync instances/tables when itemType or type changes
  useEffect(() => {
    if (activeTab === "room" && itemType) {
      const newInstances = roomInstances.filter(
        (inst) => inst.roomId === itemType,
      );
      if (newInstances.length > 0) {
        setFormData(
          (prev) =>
            ({
              ...prev,
              item: newInstances[0].id,
              checkIn: undefined,
              checkOut: undefined,
            }) as any,
        );
      }
    } else if (activeTab === "dining" && itemType) {
      const newTables = tableInstances.filter((tbl) => tbl.areaId === itemType);
      if (newTables.length > 0) {
        setFormData((prev) => ({
          ...prev,
          item: newTables[0].id,
          checkIn: undefined,
          checkOut: undefined,
        }));
        setDiningSelection({});
      }
    }
  }, [itemType, activeTab]);

  const availableInstances = roomInstances.filter(
    (inst) => inst.roomId === itemType,
  );
  const availableTables = tableInstances.filter(
    (tbl) => tbl.areaId === itemType,
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: any = {
        ...formData,
        guests: Number(formData.guests),
      };

      // For dining, handle cross-midnight reservations (e.g., 11 PM to 1 AM)
      if (formData.type === "dining" && diningSelection.diningDate) {
        const arrivalHour = diningSelection.arrivalHour!;
        const departureHour = diningSelection.departureHour!;

        // Base date object from selection
        const checkInDate = new Date(diningSelection.diningDate);
        checkInDate.setHours(arrivalHour, 0, 0, 0);

        const checkOutDate = new Date(diningSelection.diningDate);
        checkOutDate.setHours(departureHour, 0, 0, 0);

        // If departure is early morning (0-3) and arrival is evening, it belongs to next day
        if (departureHour < 4 && arrivalHour >= 16) {
          checkOutDate.setDate(checkOutDate.getDate() + 1);
        }

        payload.checkIn = checkInDate.toISOString();
        payload.checkOut = checkOutDate.toISOString();
      }

      console.log("Submitting API Payload:", payload);
      const result = await createBooking(payload);

      if (result.payment && result.payment.data?.authorization_url) {
        window.location.href = result.payment.data.authorization_url;
        return;
      }

      setSuccessBooking(result.booking || result);

      setFormData({
        type: initialType,
        itemType: initialItemType,
        item: initialItem,
        guests: 2,
        firstName: "",
        lastName: "",
        email: "",
      } as any);
      setDiningSelection({});
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-2xl mx-auto -mt-16 md:-mt-24 relative z-10"
    >
      {/* Top Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex w-full mb-8 border-b border-gray-100"
      >
        <button
          type="button"
          onClick={() => {
            setFormData(
              (prev) =>
                ({ ...prev, type: "room", itemType: rooms[0].id }) as any,
            );
          }}
          className={`w-1/2 py-6 flex items-center justify-center gap-3 border-t-2 transition-colors ${
            activeTab === "room"
              ? "border-primary text-primary bg-gray-50/50"
              : "border-transparent text-gray-400 hover:bg-gray-50"
          }`}
        >
          <Bed className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Room
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData(
              (prev) =>
                ({
                  ...prev,
                  type: "dining",
                  itemType: diningAreas[0].id,
                }) as any,
            );
          }}
          className={`w-1/2 py-6 flex items-center justify-center gap-3 border-t-2 transition-colors ${
            activeTab === "dining"
              ? "border-primary text-primary bg-gray-50/50"
              : "border-transparent text-gray-400 hover:bg-gray-50"
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Dining
          </span>
        </button>
      </motion.div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Select Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">
              {activeTab === "room"
                ? "Select Room Type"
                : "Select Seating Area"}
            </label>
            <div className="relative">
              <select
                name="itemType"
                value={itemType}
                onChange={handleChange}
                className="w-full appearance-none border border-gray-200 text-gray-900 text-sm p-4 rounded-none focus:outline-none focus:border-gray-900 bg-transparent"
              >
                {activeTab === "room" ? (
                  <>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.title}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    {diningAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.title}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">
              {activeTab === "room" ? "Select Room Number" : "Select Table"}
            </label>
            <div className="relative">
              <select
                name="item"
                value={item}
                onChange={handleChange}
                className="w-full appearance-none border border-gray-200 text-gray-900 text-sm p-4 rounded-none focus:outline-none focus:border-gray-900 bg-transparent"
              >
                {activeTab === "room"
                  ? availableInstances.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        Room {inst.roomNumber}
                      </option>
                    ))
                  : availableTables.map((tbl) => (
                      <option key={tbl.id} value={tbl.id}>
                        Table {tbl.tableNumber} (Seats {tbl.capacity})
                      </option>
                    ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Date / Calendar Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BookingCalendar
            activeTab={activeTab}
            item={item}
            errors={errors}
            checkIn={checkIn}
            checkOut={checkOut}
            diningDate={diningDate}
            setFormData={
              activeTab === "room" ? setFormData : setDiningSelection
            }
            availabilityData={availabilityData}
            isCheckingAvailability={isCheckingAvailability}
          />
        </motion.div>

        {/* Time Slots (Only visible when Dining active && date selected) */}
        {activeTab === "dining" && diningDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BookingTimePicker
              item={item}
              diningDate={diningDate}
              arrivalHour={arrivalHour}
              departureHour={departureHour}
              errors={errors}
              setFormData={setDiningSelection}
              availabilityData={availabilityData}
            />
          </motion.div>
        )}

        {/* Guests / Capacity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label className="block text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-3">
            GUESTS
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateField("guests", num)}
                className={`flex-1 min-w-[3rem] py-3 text-sm font-semibold border transition-colors ${
                  guests === num
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          {errors.guests && (
            <p className="text-[10px] text-primary font-bold mt-2">
              {errors.guests.message}
            </p>
          )}
        </motion.div>

        {/* User Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <BookingUserDetails
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="pt-6"
        >
          {availabilityError && (
            <p className="text-[10px] text-primary font-bold mb-4 text-center">
              Failed to check availability. Please try again later.
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isCheckingAvailability}
            className="w-full bg-primary hover:bg-black text-white px-6 py-5 text-[11px] font-bold tracking-widest rounded-none border-none shadow-none disabled:opacity-50"
          >
            {isSubmitting
              ? "PROCESSING..."
              : isCheckingAvailability
                ? "CHECKING AVAILABILITY..."
                : activeTab === "room"
                  ? "COMPLETE BOOKING REQUEST"
                  : "RESERVE TABLE"}
          </Button>
        </motion.div>
      </form>

      {successBooking && (
        <BookingSuccessModal
          booking={successBooking}
          onClose={() => setSuccessBooking(null)}
        />
      )}
    </motion.div>
  );
};

export default BookForm;
