'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState([
    { title: 'Sample Event', date: new Date().toISOString().split('T')[0] }
  ]);

  const handleDateClick = (arg: { dateStr: string }) => {
    alert(`Date clicked: ${arg.dateStr}`);
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
      />
    </div>
  );
};

export default Calendar;