import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../shared/ui/button";
import { FileUploadField } from "../../shared/ui/file-upload-field";
import {
  DOCUMENT_RULES,
  IMAGE_RULES,
  fileNameFromUrl,
} from "../../shared/utils/file-rules";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { eventSchema, type EventFormData } from "../schema/event-schema";

interface EventFormProps {
  initialData?: any;
  onSubmit: (data: EventFormData) => void;
  title: string;
  isLoading?: boolean;
}

const EventForm = ({
  initialData,
  onSubmit,
  title,
  isLoading,
}: EventFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      time: "",
      location: "",
      desc: "",
      leadImage: "",
      detailsFile: null,
      tickets: [],
      ...initialData,
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : "",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "tickets",
  });

  // The form stores only the image URL, so the uploaded file's name is kept here
  // to show it. Images saved before this session show the name from their URL.
  const [leadImageName, setLeadImageName] = useState<string | null>(null);
  const leadImage = watch("leadImage");
  const detailsFile = watch("detailsFile");

  const handleFormSubmit = (data: EventFormData) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-6 font-manrope">
      <h2 className="text-3xl font-marcellus text-gray-900 mb-8">{title}</h2>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 bg-white p-8 shadow-sm border border-gray-100"
      >
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
            Event Title
          </label>
          <input
            {...register("title")}
            type="text"
            className={`w-full border ${errors.title ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none transition-colors`}
          />
          {errors.title && (
            <p className="text-[10px] text-primary font-bold">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
              Date
            </label>
            <input
              {...register("date")}
              type="date"
              min={(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              })()}
              className={`w-full border ${errors.date ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none transition-colors`}
            />
            {errors.date && (
              <p className="text-[10px] text-primary font-bold">
                {errors.date.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
              Time
            </label>
            <input
              {...register("time")}
              type="time"
              className={`w-full border ${errors.time ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none transition-colors`}
            />
            {errors.time && (
              <p className="text-[10px] text-primary font-bold">
                {errors.time.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
            Location
          </label>
          <input
            {...register("location")}
            type="text"
            className={`w-full border ${errors.location ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none transition-colors`}
          />
          {errors.location && (
            <p className="text-[10px] text-primary font-bold">
              {errors.location.message}
            </p>
          )}
        </div>

        <FileUploadField
          label="Event Image"
          rules={IMAGE_RULES}
          showImagePreview
          chooseText="Choose image for the event"
          testId="event-image"
          value={
            leadImage
              ? { url: leadImage, name: leadImageName ?? fileNameFromUrl(leadImage) }
              : null
          }
          onChange={(file) => {
            setLeadImageName(file?.name ?? null);
            setValue("leadImage", file?.url ?? "", { shouldValidate: true });
          }}
          error={errors.leadImage?.message}
        />

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
            Description
          </label>
          <textarea
            {...register("desc")}
            className={`w-full border ${errors.desc ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none min-h-[120px] transition-colors`}
          ></textarea>
          {errors.desc && (
            <p className="text-[10px] text-primary font-bold">
              {errors.desc.message}
            </p>
          )}
        </div>

        <FileUploadField
          label="Event Details (optional)"
          rules={DOCUMENT_RULES}
          testId="event-details-file"
          value={detailsFile ?? null}
          onChange={(file) => setValue("detailsFile", file)}
        />

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-bold tracking-widest text-gray-900 uppercase">
              Tickets
            </h3>
            <Button
              type="button"
              onClick={() =>
                append({
                  type: "",
                  price: undefined as any,
                  totalQuantity: null,
                })
              }
              variant="ghost"
              className="text-[10px] tracking-widest flex items-center gap-1 text-primary"
            >
              <Plus className="w-3 h-3" /> ADD TICKET
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="p-8 border border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-400 font-manrope italic">
                No tickets added. This event will be listed as "Free Entry".
              </p>
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 bg-[#F8F9FA] p-6 border border-gray-100 relative group"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
                    Ticket Type
                  </label>
                  <input
                    {...register(`tickets.${index}.type`)}
                    type="text"
                    placeholder="e.g. General Admission"
                    className={`w-full border ${errors.tickets?.[index]?.type ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none bg-white transition-colors`}
                  />
                  {errors.tickets?.[index]?.type && (
                    <p className="text-[10px] text-primary font-bold">
                      {errors.tickets?.[index]?.type?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
                    Ticket Price ($)
                  </label>
                  <input
                    {...register(`tickets.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                    className={`w-full border ${errors.tickets?.[index]?.price ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none bg-white transition-colors`}
                  />
                  {errors.tickets?.[index]?.price && (
                    <p className="text-[10px] text-primary font-bold">
                      {errors.tickets?.[index]?.price?.message}
                    </p>
                  )}
                </div>
              </div>

              {watch(`tickets.${index}.totalQuantity`) === null ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentValues = getValues(`tickets.${index}`);
                    update(index, {
                      ...currentValues,
                      price: isNaN(currentValues.price)
                        ? (undefined as any)
                        : currentValues.price,
                      totalQuantity: 100,
                    });
                  }}
                  className="text-[10px] font-bold tracking-widest text-primary flex items-center gap-1 hover:opacity-75 transition-opacity"
                >
                  <Plus className="w-3 h-3" /> ADD QUANTITY LIMIT
                </button>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
                      Quantity Limit
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentValues = getValues(`tickets.${index}`);
                        update(index, {
                          ...currentValues,
                          price: isNaN(currentValues.price)
                            ? (undefined as any)
                            : currentValues.price,
                          totalQuantity: null,
                        });
                      }}
                      className="text-[9px] font-bold tracking-widest text-gray-400 hover:text-red-500 uppercase"
                    >
                      Make Unlimited
                    </button>
                  </div>
                  <input
                    {...register(`tickets.${index}.totalQuantity`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="e.g. 50"
                    className={`w-full border ${errors.tickets?.[index]?.totalQuantity ? "border-primary" : "border-gray-200"} p-3 text-sm focus:border-black outline-none bg-white transition-colors`}
                  />
                  {errors.tickets?.[index]?.totalQuantity && (
                    <p className="text-[10px] text-primary font-bold">
                      {errors.tickets?.[index]?.totalQuantity?.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {errors.tickets?.root && (
            <p className="text-[10px] text-primary font-bold">
              {errors.tickets.root.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full bg-[#2A2E33] hover:bg-black text-white px-8 py-4 text-[11px] tracking-widest rounded-none border-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SAVING...
              </>
            ) : (
              "SAVE EVENT"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
