import { useState } from 'react';
import { LoginPage } from './pages/Login/LoginPage';
import { InternshipFormPage } from './pages/InternshipForm/InternshipFormPage';
import { StudentHomePage } from './pages/Student/Home/StudentHomePage';
import { StudentTrackingPage } from './pages/Student/Tracking/StudentTrackingPage';
import { AdvisorHomePage } from './pages/Advisor/Home/AdvisorHomePage';
import { AdvisorTrackingPage } from './pages/Advisor/Tracking/AdvisorTrackingPage';
import { PraeHomePage } from './pages/Prae/Home/PraeHomePage';
import { PraeAdvisorStudentsPage } from './pages/Prae/AdvisorStudents/PraeAdvisorStudentsPage';
import { PraeAddStudentsPage } from './pages/Prae/AddStudents/PraeAddStudentsPage';
import { logoutUser, type AuthUser } from './services/api';

interface SelectedStudent {
  cpf?: string;
  name: string;
  company: string;
}

interface SelectedAdvisor {
  id: string;
  name: string;
}

interface StudentItem {
  id: string;
  name: string;
  company: string;
  pendingDocs?: number;
}

const useAppState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [option, setOption] = useState<'acompanhar' | 'cadastrar' | 'adicionar-alunos' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<SelectedAdvisor | null>(null);
  const [advisorStudents, setAdvisorStudents] = useState<Record<string, StudentItem[]>>({
    'prof-x': [
      { id: 'aluno-x', name: 'Aluno X', company: 'Appmoove', pendingDocs: 5 },
      { id: 'aluno-y', name: 'Aluno Y', company: 'Coamo' },
      { id: 'aluno-z', name: 'Aluno Z', company: 'Appmoove' },
    ],
    'prof-y': [],
    'prof-z': [],
  });

  const login = (userData: AuthUser) => setUser(userData);
  const select = (opt: 'acompanhar' | 'cadastrar' | 'adicionar-alunos') => setOption(opt);
  const back = () => {
    setOption(null);
    setSelectedStudent(null);
  };
  const logout = () => {
    logoutUser();
    setUser(null);
    setOption(null);
    setSelectedStudent(null);
    setSelectedAdvisor(null);
  };

  return {
    user,
    option,
    selectedStudent,
    selectedAdvisor,
    advisorStudents,
    setSelectedStudent,
    setSelectedAdvisor,
    setAdvisorStudents,
    login,
    select,
    back,
    logout,
  };
};

function App() {
  const state = useAppState();

  if (!state.user) {
    return <LoginPage onLogin={state.login} />;
  }

  if (state.option === 'adicionar-alunos') {
    return (
      <PraeAddStudentsPage
        user={state.user}
        currentStudents={state.advisorStudents[state.selectedAdvisor!.id] || []}
        onBack={state.back}
        onConfirm={(selected) => {
          state.setAdvisorStudents((prev) => ({
            ...prev,
            [state.selectedAdvisor!.id]: [
              ...(prev[state.selectedAdvisor!.id] || []),
              ...selected,
            ],
          }));
          state.back();
        }}
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
            students={state.advisorStudents[state.selectedAdvisor.id] || []}
            onBack={() => state.setSelectedAdvisor(null)}
            onSelectStudent={state.setSelectedStudent}
            onSelectOption={state.select}
            onUnlinkStudent={(id) => {
              state.setAdvisorStudents((prev) => ({
                ...prev,
                [state.selectedAdvisor!.id]: prev[state.selectedAdvisor!.id].filter((s) => s.id !== id),
              }));
            }}
            onNavigateToAdd={() => state.select('adicionar-alunos')}
          />
        );
      }

      return (
        <PraeHomePage
          user={state.user}
          onLogout={state.logout}
          onSelectOption={state.select}
          onSelectAdvisor={state.setSelectedAdvisor}
          onSelectStudent={state.setSelectedStudent}
        />
      );
    }

    if (state.user.role === 'professor_orientador') {
      return (
        <AdvisorHomePage
          user={state.user}
          onSelectOption={state.select}
          onLogout={state.logout}
          onSelectStudent={state.setSelectedStudent}
        />
      );
    }

    return (
      <StudentHomePage
        user={state.user}
        onSelectOption={state.select}
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
}

export default App;
