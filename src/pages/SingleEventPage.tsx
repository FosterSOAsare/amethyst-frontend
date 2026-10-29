import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../features/shared/ui/header";
import Footer from "../features/shared/ui/footer";
import { Button } from "../features/shared/ui/button";
import { useGetLoggedInUser } from "../features/auth/actions/use-get-user";
import { useDeleteEvent } from "../features/events/actions/use-delete-event";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Maximize2,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import PurchaseTicketModal from "../features/events/ui/purchase-ticket-modal";
import { useImageModal } from "../features/shared/context/image-modal-context";
import { Section } from "../features/shared/ui/section";
import { useEventById } from "../features/events/actions/use-events";
import { Loading } from "../features/shared/ui/loading";
import { motion } from "framer-motion";

const SingleEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data: user } = useGetLoggedInUser();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { data: event, isLoading, error } = useEventById(eventId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openModal } = useImageModal();

  const handleDelete = () => {
    deleteEvent(eventId!, {
      onSuccess: () => navigate("/events"),
    });
  };

  if (isLoading || isDeleting) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <Header />
        <Loading fullScreen={true} />
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] font-manrope flex flex-col items-center justify-center">
        <h1 className="text-3xl font-marcellus text-gray-900 mb-4 uppercase">
          Event Not Found
        </h1>
        <Link to="/events">
          <Button
            variant="primary"
            className="bg-[#2A2E33] text-white px-8 py-3 text-[10px] tracking-widest rounded-none uppercase"
          >
            BACK TO ALL EVENTS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-white font-manrope flex flex-col"
    >
      <Header />
      <div className="flex-1 bg-white">
        <div className="bg-[#F8F9FA] border-b border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-6xl mx-auto py-4 px-4 md:px-0 flex justify-between items-center"
          >
            <Link
              to="/events"
              className="inline-flex items-center text-[10px] text-gray-500 hover:text-primary uppercase tracking-widest font-bold"
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> BACK TO ALL EVENTS
            </Link>

            {user && (
              <div className="flex items-center gap-4">
                <Link
                  to={`/events/${eventId}/edit`}
                  className="inline-flex items-center text-[10px] text-primary hover:text-primary/80 uppercase tracking-widest font-bold gap-2"
                >
                  <Edit className="w-3 h-3" /> Edit Event
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center text-[10px] text-red-600 hover:text-red-700 uppercase tracking-widest font-bold gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Delete Event
                </button>
              </div>
            )}
          </motion.div>
        </div>

        <Section className="overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-16">
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-3xl md:text-5xl font-marcellus text-primary uppercase"
                >
                  {event.title}
                </motion.h1>
                <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-gray-500 font-medium">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" /> {event.date}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-400" /> {event.time}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />{" "}
                    {event.location}
                  </motion.span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6, type: "spring" }}
                className="w-full h-[35vh] md:h-[45vh] min-h-[300px] md:min-h-[350px] cursor-pointer group relative overflow-hidden  shadow-sm"
                onClick={() => openModal(event.leadImage, event.title)}
              >
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.7, type: "spring" }}
                  src={event.leadImage}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300"
                  >
                    <Maximize2 size={32} className="text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>

              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="text-[11px] font-bold tracking-widest text-gray-900 uppercase mb-6 border-b border-gray-100 pb-4"
                >
                  ABOUT THE EVENT
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line"
                >
                  {event.longDesc || event.desc}
                </motion.p>
                {event.detailsFile && (
                  <a
                    href={event.detailsFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-3 border border-gray-200 px-4 py-3 text-sm text-gray-900 hover:border-gray-900 transition-colors"
                    data-testid="event-details-file-link"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
                      Event details
                    </span>
                    {event.detailsFile.name}
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-[#F8F9FA] p-6 lg:p-8 border border-gray-100 shadow-sm sticky top-24"
              >
                <div className="border-b border-gray-200 pb-6 mb-8">
                  <motion.h4
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-2 flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />{" "}
                    {event.tickets.length > 0
                      ? "SECURE YOUR SPOT"
                      : "FREE ADMISSION"}
                  </motion.h4>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="font-marcellus text-2xl text-gray-900"
                  >
                    {event.tickets.length > 0
                      ? "Tickets Available"
                      : "No Reservation Required"}
                  </motion.div>
                </div>

                {event.tickets.length > 0 ? (
                  <>
                    <div className="space-y-4 mb-8">
                      {event.tickets.map((ticket, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 1.0 + i * 0.1 }}
                          className="flex justify-between items-center p-4 bg-white border border-gray-100"
                        >
                          <span className="text-sm font-bold text-gray-700">
                            {ticket.type}
                          </span>
                          <span className="text-lg font-marcellus text-primary">
                            GHS{ticket.price}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="primary"
                        className="w-full bg-primary hover:opacity-90 text-white px-6 py-5 text-[11px] font-bold tracking-widest rounded-none border-none shadow-none"
                      >
                        PURCHASE TICKETS
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                      className="mt-6 text-center pt-6 border-t border-gray-100"
                    >
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                        className="text-[10px] text-gray-400 font-medium mb-3 uppercase tracking-widest"
                      >
                        Already have a ticket?
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                      >
                        <Link
                          to="/verify-ticket"
                          className="text-[10px] font-bold text-gray-900 border-b border-gray-900 pb-1 hover:text-primary hover:border-primary transition-colors uppercase tracking-widest"
                        >
                          VERIFY TICKET STATUS
                        </Link>
                      </motion.div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="text-sm text-gray-500 italic"
                  >
                    This event is open to everyone. No tickets or registration
                    required so please just show up.
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </Section>
      </div>
      <Footer />
      {isModalOpen && (
        <PurchaseTicketModal
          event={event}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default SingleEventPage;
