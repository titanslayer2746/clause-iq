import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTasks } from "../store/slices/tasksSlice";
import { fetchContracts } from "../store/slices/contractsSlice";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks } = useAppSelector((state) => state.tasks);
  const { contracts } = useAppSelector((state) => state.contracts);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    // Fetch all tasks and contracts
    dispatch(fetchTasks({ limit: 1000 }));
    dispatch(fetchContracts({ limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    // Convert tasks and contracts to calendar events
    const events: any[] = [];

    // Add tasks as events
    tasks.forEach((task) => {
      let color = "#3b82f6"; // Blue for pending
      if (task.status === "completed") color = "#10b981"; // Green
      else if (task.status === "cancelled") color = "#6b7280"; // Gray
      else if (task.priority === "critical") color = "#ef4444"; // Red
      else if (task.priority === "high") color = "#f59e0b"; // Orange

      events.push({
        id: `task-${task.id}`,
        title: `📋 ${task.title}`,
        start: task.dueDate,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          type: "task",
          data: task,
          description: task.description,
          priority: task.priority,
          status: task.status,
          contractTitle: task.contractId?.title,
        },
      });
    });

    // Add contract deadlines as events
    contracts.forEach((contract) => {
      if (contract.extractedDataId) {
        // Note: We would need to fetch extracted data with dates
        // For now, we'll just show contract upload date as an event
        events.push({
          id: `contract-${contract.id}`,
          title: `📄 ${contract.title}`,
          start: contract.createdAt,
          backgroundColor: "#8b5cf6", // Purple
          borderColor: "#8b5cf6",
          extendedProps: {
            type: "contract",
            data: contract,
            vendor: contract.vendor,
          },
        });
      }
    });

    setCalendarEvents(events);
  }, [tasks, contracts]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setShowEventModal(true);
  };

  const handleDateClick = (info: any) => {
    // Could allow creating tasks on date click
    console.log("Date clicked:", info.dateStr);
  };

  const navigateToDetail = () => {
    if (!selectedEvent) return;

    const eventType = selectedEvent.extendedProps.type;
    const eventData = selectedEvent.extendedProps.data;

    if (eventType === "task") {
      navigate(`/contracts/${eventData.contractId.id}`);
    } else if (eventType === "contract") {
      navigate(`/contracts/${eventData.id}`);
    }

    setShowEventModal(false);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses: { [key: string]: string } = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          priorityClasses[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black">
          CALENDAR <span className="text-yellow-600">VIEW</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700 font-medium">
          View all tasks and contract deadlines in one place
        </p>
      </div>

      {/* Legend */}
      <div className="bg-yellow-400 rounded-xl border-4 border-black p-4 mb-6">
        <h3 className="text-sm font-black text-black mb-3">LEGEND</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-blue-500 mr-2 border-2 border-black"></div>
            <span className="text-sm text-black font-bold">Tasks (Pending)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-red-500 mr-2 border-2 border-black"></div>
            <span className="text-sm text-black font-bold">Critical</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-orange-500 mr-2 border-2 border-black"></div>
            <span className="text-sm text-black font-bold">High</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-green-500 mr-2 border-2 border-black"></div>
            <span className="text-sm text-black font-bold">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded bg-purple-500 mr-2 border-2 border-black"></div>
            <span className="text-sm text-black font-bold">Contracts</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border-4 border-black shadow-xl p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          nowIndicator={true}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
        />
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowEventModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-xl border-4 border-black text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-xl leading-6 font-black text-black mb-4">
                      {selectedEvent.title}
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedEvent.start).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {selectedEvent.extendedProps.type === "task" && (
                        <>
                          {selectedEvent.extendedProps.description && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Description
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedEvent.extendedProps.description}
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Status
                            </p>
                            {getStatusBadge(selectedEvent.extendedProps.status)}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Priority
                            </p>
                            {getPriorityBadge(selectedEvent.extendedProps.priority)}
                          </div>

                          {selectedEvent.extendedProps.contractTitle && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Contract
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedEvent.extendedProps.contractTitle}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {selectedEvent.extendedProps.type === "contract" && (
                        <>
                          {selectedEvent.extendedProps.vendor && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Vendor
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedEvent.extendedProps.vendor}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-400 px-6 py-3 sm:flex sm:flex-row-reverse gap-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={navigateToDetail}
                  className="w-full inline-flex justify-center rounded-lg border-2 border-black shadow-sm px-6 py-2 bg-black font-black text-yellow-400 hover:bg-gray-900 transition transform hover:scale-105 sm:w-auto"
                >
                  VIEW DETAILS
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border-2 border-black shadow-sm px-6 py-2 bg-white font-bold text-black hover:bg-gray-100 transition sm:mt-0 sm:w-auto"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

