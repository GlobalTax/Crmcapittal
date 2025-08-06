import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Users, Phone, Video } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  time: Date;
  type: 'meeting' | 'call' | 'video';
  participants?: string[];
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Reunión con Inversiones XYZ',
    time: new Date(Date.now() + 2 * 60 * 60 * 1000),
    type: 'meeting',
    participants: ['Carlos Ruiz', 'Ana García']
  },
  {
    id: '2',
    title: 'Llamada Tech Solutions',
    time: new Date(Date.now() + 4 * 60 * 60 * 1000),
    type: 'call',
    participants: ['María González']
  },
  {
    id: '3',
    title: 'Video conferencia equipo',
    time: new Date(Date.now() + 6 * 60 * 60 * 1000),
    type: 'video',
    participants: ['Todo el equipo']
  }
];

const getIcon = (type: Meeting['type']) => {
  switch (type) {
    case 'meeting': return Users;
    case 'call': return Phone;
    case 'video': return Video;
    default: return Calendar;
  }
};

export const UpcomingMeetings: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-600" />
        <h3 className="text-base font-semibold text-gray-900">Próximas citas</h3>
      </div>
      
      <div className="space-y-3">
        {mockMeetings.slice(0, 3).map((meeting) => {
          const Icon = getIcon(meeting.type);
          
          return (
            <div key={meeting.id} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-gray-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {meeting.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">
                    {format(meeting.time, 'HH:mm')}
                  </span>
                  {meeting.participants && (
                    <>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-600 truncate">
                        {meeting.participants[0]}{meeting.participants.length > 1 && ` +${meeting.participants.length - 1}`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};