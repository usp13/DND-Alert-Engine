"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ContainerItem } from '@/types';
import { initialContainers } from '@/data/initialContainers';
import { demoCompanies, Header } from '@/components/Header';
import { TabNavigation, TabType } from '@/components/TabNavigation';
import { DashboardTab } from '@/components/DashboardTab';
import { AutoImportTab } from '@/components/AutoImportTab';
import { BulkImportTab } from '@/components/BulkImportTab';
import { AddContainerTab } from '@/components/AddContainerTab';
import { SavingsReportTab } from '@/components/SavingsReportTab';
import { LineRulesTab } from '@/components/LineRulesTab';
import { WhatsAppPreviewTab } from '@/components/WhatsAppPreviewTab';
import { QuickImportModal } from '@/components/QuickImportModal';
import { Footer } from '@/components/Footer';
import { AlertModal } from '@/components/AlertModal';
import { calculateContainerStatus } from '@/utils/dndCalculations';
import { AuthFlow, UserSession } from '@/components/auth/AuthFlow';

export function MainApp() {
  // Authentication State: default true or false (can be toggled)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    email: 'aman@riddhisiddhi.com',
    firmName: 'Riddhi Siddhi CHA',
    contactPerson: 'Aman Dana',
    mobile: '8160024858',
    city: 'Gandhidham (Kandla)',
  });

  const [containers, setContainers] = useState<ContainerItem[]>(initialContainers);
  const [currentCompany, setCurrentCompany] = useState<string>(demoCompanies[0]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);
  const [selectedAlertContainer, setSelectedAlertContainer] = useState<ContainerItem | null>(null);

  const [quickImportOpen, setQuickImportOpen] = useState<boolean>(false);
  const [quickImportDocId, setQuickImportDocId] = useState<string>('doc-1');

  // Fetch live containers from Supabase on mount
  useEffect(() => {
    fetch('/api/containers')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.containers) && data.containers.length > 0) {
          const mapped: ContainerItem[] = data.containers.map((c: any) => ({
            id: c.id,
            containerNo: c.container_number,
            line: c.shipping_line || 'Maersk',
            type: (c.container_type || '40ft') as any,
            port: c.port || 'Kandla',
            dischargeDate: c.discharge_date || new Date().toISOString().split('T')[0],
            importer: c.importer_name || 'Importer',
            vessel: c.vessel_name || 'Vessel',
            blNumber: c.bl_number || `BL-${c.id?.slice(0, 6)}`,
            chaFirm: 'Riddhi Siddhi CHA',
            opsPhone: c.importer_phone || '+91 98765 43210',
            ownerPhone: '+91 8160024858',
            customsCleared: c.status === 'cleared',
            truckArranged: false,
            warehouseReady: false,
          }));
          // Merge Supabase containers with defaults avoiding duplicates
          setContainers((prev) => {
            const existingNos = new Set(mapped.map((m) => m.containerNo));
            const remainingDefaults = prev.filter((p) => !existingNos.has(p.containerNo));
            return [...mapped, ...remainingDefaults];
          });
        }
      })
      .catch((err) => console.log('Using local container state:', err));
  }, []);

  // Urgent containers count for header notification badge
  const urgentContainers = useMemo(() => {
    return containers.filter((c) => {
      const calc = calculateContainerStatus(c);
      return calc.status === 'warning' || calc.status === 'critical';
    });
  }, [containers]);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setCurrentCompany(user.firmName || demoCompanies[0]);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleAddContainer = (newContainer: ContainerItem) => {
    setContainers((prev) => [newContainer, ...prev]);
  };

  const handleAddBulkContainers = (bulkList: ContainerItem[]) => {
    setContainers((prev) => [...bulkList, ...prev]);

    // Persist bulk import to Supabase
    fetch('/api/import/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        containers: bulkList.map((c) => ({
          container_number: c.containerNo,
          shipping_line: c.line,
          demurrage_free_days: 14,
          discharge_date: c.dischargeDate,
          bl_number: c.blNumber,
        })),
      }),
    }).catch((err) => console.error('Failed saving bulk import to Supabase:', err));
  };

  const handleOpenQuickModal = (docId?: string) => {
    if (docId) setQuickImportDocId(docId);
    setQuickImportOpen(true);
  };

  const handleOpenAlert = (container: ContainerItem) => {
    setSelectedAlertContainer(container);
    setAlertModalOpen(true);
  };

  const handleOpenAlertsHeader = () => {
    if (urgentContainers.length > 0) {
      setSelectedAlertContainer(urgentContainers[0]);
    } else if (containers.length > 0) {
      setSelectedAlertContainer(containers[0]);
    }
    setAlertModalOpen(true);
  };

  // If not authenticated, render the complete 4-screen Auth & Registration Flow
  if (!isAuthenticated) {
    return (
      <AuthFlow
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060a10] text-[#dfe6f0] flex flex-col font-sans selection:bg-[#f97316]/30 selection:text-white">
      {/* Header Bar */}
      <Header
        urgentCount={urgentContainers.length}
        currentCompany={currentCompany}
        onCompanyChange={setCurrentCompany}
        onOpenAlertsModal={handleOpenAlertsHeader}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        urgentBadgeCount={urgentContainers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            containers={containers}
            onSendAlert={handleOpenAlert}
          />
        )}

        {activeTab === 'bulk-import' && (
          <BulkImportTab
            onAddBulkContainers={handleAddBulkContainers}
            onNavigateToWhatsAppBot={() => setActiveTab('whatsapp-bot')}
          />
        )}

        {activeTab === 'whatsapp-bot' && (
          <AutoImportTab
            onAddBulkContainers={handleAddBulkContainers}
            onOpenQuickModal={handleOpenQuickModal}
          />
        )}

        {activeTab === 'add' && (
          <AddContainerTab
            onAddContainer={handleAddContainer}
            onOpenQuickImport={() => handleOpenQuickModal('doc-1')}
          />
        )}

        {activeTab === 'report' && (
          <SavingsReportTab />
        )}

        {activeTab === 'rules' && (
          <LineRulesTab />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppPreviewTab
            customContainerNo={selectedAlertContainer?.containerNo}
            customLine={selectedAlertContainer?.line}
            customImporter={selectedAlertContainer?.importer}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* WhatsApp PDF Quick Import Modal */}
      <QuickImportModal
        isOpen={quickImportOpen}
        defaultDocId={quickImportDocId}
        onClose={() => setQuickImportOpen(false)}
        onImportContainers={(imported) => {
          handleAddBulkContainers(imported);
          setActiveTab('dashboard');
        }}
      />

      {/* WhatsApp Dispatch Modal */}
      {alertModalOpen && (
        <AlertModal
          container={selectedAlertContainer}
          urgentContainers={urgentContainers}
          onClose={() => setAlertModalOpen(false)}
          onSelectContainer={(c) => setSelectedAlertContainer(c)}
        />
      )}
    </div>
  );
}

export default MainApp;
