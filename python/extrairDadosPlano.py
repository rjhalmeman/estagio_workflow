import tkinter as tk
from tkinter import filedialog, messagebox
import pdfplumber
import psycopg2
import re
import json

class ExtratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Extrator de PDF para Banco de Dados")
        self.root.geometry("550x650") # Aumentei a janela para caber a pré-visualização
        self.root.resizable(False, False)

        # Variáveis fixas de conexão
        self.senha_banco = "Lageado001."
        self.nome_banco = "estagio_flow"
        self.dados_extraidos = None

        tk.Label(root, text="Configurações do Banco (PostgreSQL)", font=("Arial", 12, "bold")).pack(pady=10)

        # Usuário (mantive caso você use outro além de postgres)
        frame_user = tk.Frame(root)
        frame_user.pack(fill='x', padx=50, pady=5)
        tk.Label(frame_user, text="Usuário BD:", width=12, anchor='w').pack(side='left')
        self.entry_user = tk.Entry(frame_user)
        self.entry_user.insert(0, "postgres")
        self.entry_user.pack(side='right', expand=True, fill='x')

        # Banco (Apenas para visualização, já que está fixo)
        frame_bd = tk.Frame(root)
        frame_bd.pack(fill='x', padx=50, pady=5)
        tk.Label(frame_bd, text="Banco:", width=12, anchor='w').pack(side='left')
        self.entry_bd = tk.Entry(frame_bd)
        self.entry_bd.insert(0, self.nome_banco)
        self.entry_bd.config(state='readonly')
        self.entry_bd.pack(side='right', expand=True, fill='x')

        # --- BOTÃO 1: LER PDF ---
        self.btn_ler = tk.Button(root, text="1. Selecionar PDF e Ler Dados", bg="#2196F3", fg="white", font=("Arial", 10, "bold"), command=self.selecionar_e_ler)
        self.btn_ler.pack(pady=15, ipadx=10, ipady=5)

        # Pré-visualização dos Dados
        tk.Label(root, text="Pré-visualização dos Dados:").pack(anchor='w', padx=50)
        self.text_preview = tk.Text(root, height=12, width=55, bg="#f4f4f4", font=("Courier New", 10))
        self.text_preview.pack(pady=5, padx=50)
        self.text_preview.insert(tk.END, "Aguardando leitura do PDF...")
        self.text_preview.config(state=tk.DISABLED) # Impede o usuário de digitar aqui

        # --- BOTÃO 2: ENVIAR PARA BD ---
        self.btn_enviar = tk.Button(root, text="2. Confirmar e Enviar para o BD", bg="#4CAF50", fg="white", font=("Arial", 10, "bold"), command=self.enviar_para_bd, state=tk.DISABLED)
        self.btn_enviar.pack(pady=15, ipadx=10, ipady=5)

        # Status
        self.lbl_status = tk.Label(root, text="Aguardando ação...", fg="gray")
        self.lbl_status.pack(side='bottom', pady=10)

    def selecionar_e_ler(self):
        # Abre a janela para escolher o PDF
        caminho_pdf = filedialog.askopenfilename(
            title="Selecione o Plano de Estágio",
            filetypes=[("Arquivos PDF", "*.pdf")]
        )

        if not caminho_pdf:
            return # Usuário cancelou

        self.lbl_status.config(text="Lendo PDF...", fg="blue")
        self.root.update()

        try:
            # Extrai os dados
            self.dados_extraidos = self.extrair_dados_pdf(caminho_pdf)
            
            # Mostra no Text Box
            self.text_preview.config(state=tk.NORMAL)
            self.text_preview.delete("1.0", tk.END)
            
            # Formata o dicionário em JSON bonitinho para leitura na tela
            texto_formatado = json.dumps(self.dados_extraidos, indent=4, ensure_ascii=False)
            self.text_preview.insert(tk.END, texto_formatado)
            self.text_preview.config(state=tk.DISABLED)

            # Habilita o botão de envio
            self.btn_enviar.config(state=tk.NORMAL)
            self.lbl_status.config(text="Leitura concluída. Verifique os dados e envie.", fg="green")

        except Exception as e:
            messagebox.showerror("Erro de Leitura", f"Erro ao ler o PDF:\n{e}")
            self.lbl_status.config(text="Erro na leitura.", fg="red")
            self.btn_enviar.config(state=tk.DISABLED)

    def enviar_para_bd(self):
        usuario = self.entry_user.get()

        if not self.dados_extraidos:
            message