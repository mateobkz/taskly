import React from 'react';
import DashboardSelect from './selector/DashboardSelect';
import CreateDashboardDialog from './selector/CreateDashboardDialog';

export default function DashboardSelector() {
  return (
    <div className="flex items-center gap-2">
      <DashboardSelect />
      <CreateDashboardDialog />
    </div>
  );
}