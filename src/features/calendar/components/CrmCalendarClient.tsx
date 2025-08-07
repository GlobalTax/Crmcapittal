import React from 'react';
import { CompactCalendarSidebar } from './CompactCalendarSidebar';
import { CrmWeekView } from './CrmWeekView';

export const CrmCalendarClient: React.FC = () => {
  return (
    <div className="h-screen flex bg-background">
      {/* 25% - Compact Sidebar */}
      <CompactCalendarSidebar />
      
      {/* 75% - Week View */}
      <div className="flex-1">
        <CrmWeekView />
      </div>
    </div>
  );
};