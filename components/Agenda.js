import React from "react";

const Agenda = () => {
  const events = [
    {
      id: "1",
      title: "Web Dev Lecture",
      startTime: new Date(),
      endTime: new Date(),
      type: "lecture",
    },
    {
      id: "2",
      title: "Team Meeting",
      startTime: new Date(),
      endTime: new Date(),
      type: "meeting",
    },
  ];

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const today = new Date().getDate();

  return (
    <div className="flex flex-col h-full">
      {/* Mini Calendar Visual */}
      <div className="grid grid-cols-7 gap-1 text-center mb-6">
        {days.map((d) => (
          <div key={d} className="text-[10px] text-gray-500 font-mono mb-2">
            {d}
          </div>
        ))}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={`
              h-6 w-6 flex items-center justify-center text-xs rounded-full mx-auto
              ${
                i + 1 === today
                  ? "bg-nexus-purple text-white shadow-lg shadow-nexus-purple/50"
                  : "text-gray-400 hover:bg-white/10"
              }
            `}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-white/10 mb-4" />

      {/* Agenda List */}
      <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold">
        Today's Timeline
      </h4>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="relative pl-4 border-l-2 border-nexus-teal/30"
          >
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-nexus-teal shadow-[0_0_8px_#65BBBD]" />
            <h5 className="text-sm font-semibold text-gray-200">
              {event.title}
            </h5>
            <span className="text-xs text-nexus-purple font-mono">
              10:00 AM - 11:30 AM
            </span>
            <div className="mt-1">
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">
                {event.type}
              </span>
            </div>
          </div>
        ))}

        {/* Empty State / Interactive Object Placeholder */}
        <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl text-center">
          <span className="text-xs text-gray-600 block">No more events</span>
          <button className="text-[10px] text-nexus-purple mt-2 hover:underline">
            + Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
