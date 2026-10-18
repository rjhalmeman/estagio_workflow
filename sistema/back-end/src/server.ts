import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[Servidor] Ativo na porta http://localhost:${PORT}`);
  }
});
