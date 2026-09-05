import React, { useState } from 'react';
import { Input } from '../../components/atoms/Input/Input';
import { Button } from '../../components/atoms/Button/Button';
import { loginUser } from '../../services/api';
import type { AuthUser } from '../../services/api';
import './LoginPage.css';

// Importa o Checkbox do M3
import '@material/web/checkbox/checkbox';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

const isCheckboxElement = (target: EventTarget | null): target is EventTarget & { checked: boolean } => {
  return target !== null && 'checked' in target;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-page theme-light">
      <div className="login-left-panel" />
      <div className="login-right-panel">
        <div className="login-card-content">
          {/* Logo UTFPR Estágio */}
          <div className="login-brand-logo">
            <img src="/logo/image 7.png" alt="UTFPR Estágio Logo" className="login-logo-img" />
            <div className="login-logo-subtext">ESTÁGIO</div>
          </div>

          <div className="login-header">
            <h2>Login</h2>
            <p>Informe seus dados abaixo.</p>
          </div>

          <hr className="login-divider" />

          {error && (
            <div className="login-error-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              type="email"
              label="Email"
              placeholder="ex: joao@alunos.utfpr.edu.br"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              label="Senha"
              placeholder="Digite sua senha"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="login-options-row">
              <label className="login-remember-label">
                <md-checkbox
                  id="remember"
                  checked={remember}
                  disabled={isLoading}
                  onChange={(e) => {
                    if (isCheckboxElement(e.target)) {
                      setRemember(e.target.checked);
                    }
                  }}
                />
                <span>Lembrar conta</span>
              </label>
              <a href="#forgot" className="login-forgot-link">
                Esqueci minha senha
              </a>
            </div>

            <Button type="submit" variant="primary" isLoading={isLoading} className="login-submit-btn">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
