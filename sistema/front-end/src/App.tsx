import React, { Suspense } from 'react';
import { AppProvider, useAppContext } from './store/AppContext';

const LoginPage = React.lazy(() => import('./pages/Login/LoginPage'));
const InternshipFormPage = React.lazy(() => import('./pages/InternshipForm/InternshipFormPage'));
const StudentHomePage = React.lazy(() => import('./pages/Student/Home/StudentHomePage'));
const StudentTrackingPage = React.lazy(() => import('./pages/Student/Tracking/StudentTrackingPage'));
const AdvisorHomePage = React.lazy(() => import('./pages/Advisor/Home/AdvisorHomePage'));
const AdvisorTrackingPage = React.lazy(() => import('./pages/Advisor/Tracking/AdvisorTrackingPage'));
const PraeHomePage = React.lazy(() => import('./pages/Prae/Home/PraeHomePage'));
const PraeAdvisorStudentsPage = React.lazy(
  () => import('./pages/Prae/AdvisorStudents/PraeAdvisorStudentsPage')
);
const PraeAddStudentsPage = React.lazy(() => import('./pages/Prae/AddStudents/PraeAddStudentsPage'));
const ExternalHomePage = React.lazy(() => import('./pages/External/Home/ExternalHomePage'));

const AppRouter: React.FC = () => {
  const state = useAppContext();

  if (state.initializing) {
    return <div className="page-body">Carregando sessão...</div>;
  }

  if (!state.user) {
    return <LoginPage onLogin={state.login} />;
  }

  if (state.option === 'adicionar-alunos' && state.selectedAdvisor) {
    return (
      <PraeAddStudentsPage
        user={state.user}
        advisor={state.selectedAdvisor}
        onBack={state.back}
        onConfirm={state.back}
      />
    );
  }

  if (!state.option) {
    if (state.user.role === 'professor_prae') {
      if (state.selectedAdvisor) {
        return (
          <PraeAdvisorStudentsPage
            user={state.user}
            advisor={state.selectedAdvisor}
            onBack={() => state.setSelectedAdvisor(null)}
            onSelectStudent={state.setSelectedStudent}
            onSelectOption={state.selectOption}
            onNavigateToAdd={() => state.selectOption('adicionar-alunos')}
          />
        );
      }

      return (
        <PraeHomePage
          user={state.user}
          onLogout={state.logout}
          onSelectOption={state.selectOption}
          onSelectAdvisor={state.setSelectedAdvisor}
          onSelectStudent={state.setSelectedStudent}
        />
      );
    }

    if (state.user.role === 'professor_orientador') {
      return (
        <AdvisorHomePage
          user={state.user}
          onSelectOption={state.selectOption}
          onLogout={state.logout}
          onSelectStudent={state.setSelectedStudent}
        />
      );
    }

    if (
      state.user.role === 'supervisor' ||
      state.user.role === 'representante_uce' ||
      state.user.role === 'visitante'
    ) {
      return (
        <ExternalHomePage
          user={state.user}
          onLogout={state.logout}
          onSelectStudent={state.setSelectedStudent}
          onSelectOption={state.selectOption}
        />
      );
    }

    return (
      <StudentHomePage
        user={state.user}
        onSelectOption={state.selectOption}
        onLogout={state.logout}
      />
    );
  }

  if (state.option === 'cadastrar') {
    return <InternshipFormPage user={state.user} onBack={state.back} />;
  }

  if (state.user.role === 'aluno') {
    return (
      <StudentTrackingPage
        user={state.user}
        selectedStudent={state.selectedStudent}
        onBack={state.back}
      />
    );
  }

  return (
    <AdvisorTrackingPage
      user={state.user}
      selectedStudent={state.selectedStudent}
      advisorName={state.selectedAdvisor?.name}
      onBack={state.back}
    />
  );
};

function App(): React.ReactElement {
  return (
    <AppProvider>
      <Suspense fallback={<div className="page-body">Carregando...</div>}>
        <AppRouter />
      </Suspense>
    </AppProvider>
  );
}

export default App;
