import React, { useState, useMemo } from 'react';
import { ContainerItem } from './types';
import { initialContainers } from './data/initialContainers';
import { demoCompanies, Header } from './components/Header';
import { TabNavigation, TabType } from './components/TabNavigation';
import { DashboardTab } from './components/DashboardTab';
import { AutoImportTab } from './components/AutoImportTab';
import { AddContainerTab } from './components/AddContainerTab';
import { SavingsReportTab } from './components/SavingsReportTab';
import { LineRulesTab } from './components/LineRulesTab';
import { WhatsAppPreviewTab } from './components/WhatsAppPreviewTab';
import { QuickImportModal } from './components/QuickImportModal';
import { Footer } from './components/Footer';
import { AlertModal } from './components/AlertModal';
import { calculateContainerStatus } from './utils/dndCalculations';
import { AuthFlow, UserSession } from './components/auth/AuthFlow';

export function App() {
  // Authentication State: default false to show login & registration flow first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  const [containers, setContainers] = useState<ContainerItem[]>(initialContainers);
  const [currentCompany, setCurrentCompany] = useState<string>(demoCompanies[0]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);
  const [selectedAlertContainer, setSelectedAlertContainer] = useState<ContainerItem | null>(null);

  const [quickImportOpen, setQuickImportOpen] = useState<boolean>(false);
  const [quickImportDocId, setQuickImportDocId] = useState<string>('doc-1');

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

        {activeTab === 'auto-import' && (
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

export default App;
