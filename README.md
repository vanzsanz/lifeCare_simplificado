# LifeCare Lite — Cadastro Simplificado de Pacientes

Versão minimalista, rápida e focada exclusivamente no **cadastro e gerenciamento de pacientes**, eliminando a sobrecarga de abas complexas, dashboards hospitalares e módulos pesados do projeto original.

---

## 🎯 Por que esta versão é bem mais simplificada?

| Característica | LifeCare Original | LifeCare Lite (Esta versão) |
| :--- | :--- | :--- |
| **Foco principal** | Gestão hospitalar completa (Consultas, Relatórios, Histórico, Dashboard) | **100% focado no Cadastro e Gestão de Pacientes** |
| **Interface** | Sidebar com 5 telas, modais dinâmicos para tudo e gráficos | **Tela única e intuitiva** (Formulário + Tabela lado a lado) |
| **Complexidade de Código** | ~1.300 linhas entre CSS/JS com múltiplos fluxos | **Código limpo, direto e fácil de entender** |
| **Edição de Dados** | Modais sobrepostos com injeção de HTML | **Edição inline direta no próprio formulário** |
| **Recursos de Usabilidade** | Genéricos | **Máscaras automáticas de CPF e Telefone, link direto pro WhatsApp, cálculo automático de idade** |

---

## 🚀 Como Executar

Não precisa de nenhuma instalação (Node, npm ou Python)!

1. Abra a pasta `cadastro-pacientes`.
2. Dê um **duplo clique no arquivo `index.html`** no seu navegador preferido (Chrome, Edge, Firefox, Safari).
3. Pronto! O sistema já vem com 3 registros de exemplo para você testar imediatamente.

---

## ✨ Recursos Implementados

1. **Cadastro Completo & Rápido**:
   - Nome completo, CPF, Data de Nascimento, Telefone/WhatsApp, Gênero, E-mail.
   - Campo para **Alergias ou Condições Especiais** (com destaque visual em vermelho no prontuário).
   - Observações clínicas e histórico do paciente.

2. **Facilidades Automáticas**:
   - **Máscaras automáticas** nos campos de CPF (`000.000.000-00`) e Telefone (`(00) 00000-0000`).
   - **Cálculo automático de idade** a partir da data de nascimento.
   - **Link direto para o WhatsApp** ao clicar no telefone do paciente.

3. **Busca em Tempo Real**:
   - Filtro instantâneo por Nome, CPF, Telefone ou Alergias enquanto você digita.

4. **Gerenciamento Completo (CRUD)**:
   - **Criar**: Salva na hora.
   - **Visualizar**: Ficha detalhada com botão para **Imprimir Ficha**.
   - **Editar**: Preenche o formulário com destaque visual e botão "Cancelar Edição".
   - **Excluir**: Remove com confirmação de segurança.

5. **Persistência de Dados**:
   - Utiliza `localStorage` do navegador para que seus dados não sejam perdidos ao recarregar a página.

6. **Exportação de Dados**:
   - Botão **"Exportar CSV"** que gera uma planilha compatível com Microsoft Excel e Google Planilhas.

---

## 📁 Estrutura de Arquivos

```
cadastro-pacientes/
├── index.html     # Estrutura semântica e acessível
├── style.css      # Estilização moderna, limpa e responsiva
├── app.js         # Lógica sem frameworks, modular e comentada
└── README.md      # Instruções de uso e comparação
```
