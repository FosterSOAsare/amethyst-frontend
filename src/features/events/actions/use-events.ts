import { useQuery } from "@tanstack/react-query";
import api from "../../shared/actions/api";

export interface Event {
  id: string;
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  desc: string;
  longDesc?: string;
  leadImage: string;
  detailsFile?: { url: string; name: string } | null; // optional PDF or Word document
  eventId: string; // The human-readable string EV_XXXX
  tickets: Array<{
    _id: string; // The MongoDB ObjectId for the ticket tier
    type: string;
    price: number;
    totalQuantity?: number | null;
    availableQuantity?: number | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

const fetchEvents = async (): Promise<Event[]> => {
  return api<Event[]>("/events");
};

const fetchEventById = async (id: string): Promise<Event> => {
  return api<Event>(`/events/${id}`);
};

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
};

export const useEventById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => (id ? fetchEventById(id) : Promise.reject("No event ID")),
    enabled: !!id,
  });
};
