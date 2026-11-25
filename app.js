class Paciente {
    constructor(d) {
        this.id = d.id || `LC-${Math.floor(1000 + Math.random() * 9000)}`;
        this.nome = d.nome;
        this.cpf = d.cpf;
        this.idade = Number(d.idade);
        this.convenio = d.convenio;
        this.status = d.status;
        this.alergias = d.alergias || '';
        this.exames = d.exames || '';
        this.plano = d.plano;
        this.atualizadoEm = d.atualizadoEm || Paciente.agora();
        this.arquivado = Boolean(d.arquivado);
        this.arquivadoEm = d.arquivadoEm || null;
        this.historicoEvolucoes = Array.isArray(d.historicoEvolucoes) && d.historicoEvolucoes.length
            ? d.historicoEvolucoes
            : [{ dataHora: this.atualizadoEm, status: this.status, exames: this.exames, plano: this.plano }];
    }

    registrarEvolucao(item) {
        this.historicoEvolucoes.unshift({
            dataHora: item.dataHora || Paciente.agora(),
            status: item.status,
            exames: item.exames || '',
            plano: item.plano
        });
    }

    temAlerta() {
        return Boolean(this.alergias && this.alergias.trim());
    }

    static agora() {
        const d = new Date();
        return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
}

class SistemaLifeCare {
    constructor() {
        this.key = 'lifecare_prontuarios_v1';
        this.visao = 'ativos';
        this.pacientes = this.carregar();
        this.el = {
            form: document.getElementById('patient-form'),
            formTitle: document.getElementById('form-title'),
            btnSubmit: document.getElementById('btn-submit'),
            btnCancel: document.getElementById('btn-cancel'),
            heading: document.getElementById('records-heading'),
            lista: document.getElementById('patients-list'),
            contador: document.getElementById('total-count'),
            busca: document.getElementById('search-input'),
            filtroStatus: document.getElementById('filter-status'),
            tabAtivos: document.getElementById('tab-ativos'),
            tabArquivados: document.getElementById('tab-arquivados'),
            banner: document.getElementById('feedback-banner'),
            modal: document.getElementById('details-modal'),
            modalTitulo: document.getElementById('modal-patient-name'),
            modalBody: document.getElementById('modal-body'),
            closeModal: document.getElementById('close-modal'),
            cpf: document.getElementById('cpf')
        };
        this.eventos();
        this.renderizar();
    }

    iniciais() {
        return [
            new Paciente({
                id: 'LC-1001',
                nome: 'Helena Vasconcelos Mendes',
                cpf: '348.912.401-22',
                idade: 54,
                convenio: 'Convênio',
                status: 'Em Tratamento',
                alergias: 'Alergia severa a Dipirona e Contrastes Iodados',
                exames: 'ECG sinusal; Hemograma e PCR normais.',
                plano: 'Acompanhamento cardiológico. Losartana 50mg 1x/dia; retorno em 15 dias.',
                atualizadoEm: '16/11/2026 08:30'
            }),
            new Paciente({
                id: 'LC-1002',
                nome: 'Roberto Carlos Nogueira',
                cpf: '712.045.889-10',
                idade: 68,
                convenio: 'Particular',
                status: 'Internado',
                exames: 'Raio-X de tórax em evolução satisfatória; SpO2 97%.',
                plano: 'Antibioticoterapia venosa conforme protocolo. Sinais vitais a cada 4h.',
                atualizadoEm: '16/11/2026 09:45'
            })
        ];
    }

    formatarCPF(v) {
        return v.replace(/\D/g, '').slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    carregar() {
        try {
            const raw = JSON.parse(localStorage.getItem(this.key));
            return Array.isArray(raw) && raw.length ? raw.map(p => new Paciente(p)) : this.iniciais();
        } catch {
            return this.iniciais();
        }
    }

    salvar() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.pacientes));
        } catch {}
    }

    feedback(msg, erro = false) {
        if (!this.el.banner) return;
        this.el.banner.textContent = msg;
        this.el.banner.classList.toggle('error', erro);
        this.el.banner.classList.remove('hidden');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.el.banner.classList.add('hidden'), 5000);
    }

    setVisao(v) {
        this.visao = v;
        const ativos = v === 'ativos';
        if (this.el.heading) this.el.heading.textContent = ativos ? 'Prontuários Ativos' : 'Prontuários Arquivados (CFM)';
        this.el.tabAtivos?.classList.toggle('btn-primary', ativos);
        this.el.tabAtivos?.classList.toggle('btn-secondary', !ativos);
        this.el.tabArquivados?.classList.toggle('btn-primary', !ativos);
        this.el.tabArquivados?.classList.toggle('btn-secondary', ativos);
        if (this.el.filtroStatus) {
            this.el.filtroStatus.disabled = !ativos;
            if (!ativos) this.el.filtroStatus.value = 'todos';
        }
        this.renderizar();
    }

    eventos() {
        this.el.cpf?.addEventListener('input', e => {
            e.target.value = this.formatarCPF(e.target.value);
        });
        this.el.tabAtivos?.addEventListener('click', () => this.setVisao('ativos'));
        this.el.tabArquivados?.addEventListener('click', () => this.setVisao('arquivados'));
        this.el.form?.addEventListener('submit', e => this.salvarFormulario(e));
        this.el.btnCancel?.addEventListener('click', () => this.resetar());
        this.el.busca?.addEventListener('input', () => this.renderizar());
        this.el.filtroStatus?.addEventListener('change', () => this.renderizar());

        
        this.el.lista?.addEventListener('click', e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const { action, id } = btn.dataset;
            if (action === 'view') this.abrirModal(id);
            if (action === 'edit') this.editar(id);
            if (action === 'archive') this.arquivar(id);
            if (action === 'unarchive') this.reativar(id);
            if (action === 'delete') this.excluir(id);
        });

        this.el.closeModal?.addEventListener('click', () => this.el.modal?.classList.add('hidden'));
        this.el.modal?.addEventListener('click', e => {
            if (e.target === this.el.modal) this.el.modal.classList.add('hidden');
        });
    }

    salvarFormulario(e) {
        e.preventDefault();

        const idEdicao = document.getElementById('patient-id')?.value || '';
        const nome = document.getElementById('nome').value.trim().replace(/\s+/g, ' ');
        const cpf = this.formatarCPF(document.getElementById('cpf').value);
        const idade = Number(document.getElementById('idade').value);
        const convenio = document.getElementById('convenio').value;
        const status = document.getElementById('status').value;
        const alergias = document.getElementById('alergias').value.trim();
        const exames = document.getElementById('exames').value.trim();
        const plano = document.getElementById('plano').value.trim();
        const agora = Paciente.agora();

        if (!nome || nome.split(' ').length < 2) {
            return this.feedback('Informe nome e sobrenome.', true);
        }
        if (cpf.replace(/\D/g, '').length !== 11) {
            return this.feedback('Informe um CPF com 11 dígitos.', true);
        }
        if (Number.isNaN(idade) || idade < 0 || idade > 125) {
            return this.feedback('Informe uma idade válida (0 a 125).', true);
        }
        if (!plano) {
            return this.feedback('Preencha o plano de tratamento.', true);
        }

        const cpfLimpo = cpf.replace(/\D/g, '');
        const duplicado = this.pacientes.some(
            p => !p.arquivado && p.cpf.replace(/\D/g, '') === cpfLimpo && p.id !== idEdicao
        );
        if (duplicado) {
            return this.feedback('Já existe um prontuário ativo com este CPF.', true);
        }

        const dados = { id: idEdicao || undefined, nome, cpf, idade, convenio, status, alergias, exames, plano, atualizadoEm: agora };

        if (idEdicao) {
            const idx = this.pacientes.findIndex(p => p.id === idEdicao);
            if (idx !== -1) {
                const base = this.pacientes[idx];
                const atualizado = new Paciente({ ...base, ...dados, historicoEvolucoes: [...base.historicoEvolucoes] });
                atualizado.registrarEvolucao({ status, exames, plano, dataHora: agora });
                this.pacientes[idx] = atualizado;
                this.feedback('Plano de tratamento atualizado com sucesso.');
            }
        } else {
            this.pacientes.unshift(new Paciente(dados));
            this.setVisao('ativos');
            this.feedback('Novo prontuário registrado digitalmente.');
        }

        this.salvar();
        this.resetar();
        this.renderizar();
    }

    renderizar() {
        const termo = (this.el.busca?.value || '').toLowerCase().trim();
        const st = this.el.filtroStatus?.value || 'todos';
        const arq = this.visao === 'arquivados';

        const lista = this.pacientes.filter(p => {
            if (Boolean(p.arquivado) !== arq) return false;
            const textoOk = [p.nome, p.cpf, p.alergias, p.id].some(v => (v || '').toLowerCase().includes(termo));
            const statusOk = arq || st === 'todos' || p.status === st;
            return textoOk && statusOk;
        });

        if (this.el.contador) {
            this.el.contador.textContent = `${lista.length} ${lista.length === 1 ? 'registro' : 'registros'}`;
        }

        if (!lista.length) {
            this.el.lista.innerHTML = '<div class="card"><p>Nenhum prontuário encontrado para os critérios informados.</p></div>';
            return;
        }

        this.el.lista.innerHTML = lista.map(p => {
            const alerta = p.temAlerta();
            const badge = p.arquivado ? `Arquivado${p.arquivadoEm ? ` (${p.arquivadoEm})` : ''}` : p.status;
            const acoes = p.arquivado
                ? `
                    <button type="button" class="btn btn-sm btn-view" data-action="view" data-id="${p.id}">Visualizar Prontuário</button>
                    <button type="button" class="btn btn-sm btn-edit" data-action="unarchive" data-id="${p.id}">Reativar Prontuário</button>
                `
                : `
                    <button type="button" class="btn btn-sm btn-view" data-action="view" data-id="${p.id}">Visualizar Prontuário</button>
                    <button type="button" class="btn btn-sm btn-edit" data-action="edit" data-id="${p.id}">Atualizar Plano</button>
                    <button type="button" class="btn btn-sm btn-archive" data-action="archive" data-id="${p.id}">Arquivar (CFM)</button>
                    <button type="button" class="btn btn-sm btn-archive" data-action="delete" data-id="${p.id}">Excluir</button>
                `;

            return `
                <article class="patient-card ${alerta ? 'has-alert' : ''}">
                    <div class="patient-header">
                        <div class="patient-title">
                            <h3>${p.nome}</h3>
                            <span class="patient-meta">Prontuário: <strong>${p.id}</strong> • CPF: ${p.cpf} • ${p.idade} anos • ${p.convenio}</span>
                        </div>
                        <span class="status-badge ${p.status === 'Internado' ? 'internado' : ''}">${badge}</span>
                    </div>
                    ${alerta ? `<div class="alert-box">ALERTA CRÍTICO: ${p.alergias}</div>` : ''}
                    <div class="patient-info-block">
                        <p><strong>Exames Recentes:</strong> ${p.exames || 'Nenhum exame anexado até o momento.'}</p>
                        <p><strong>Plano de Tratamento:</strong> ${p.plano}</p>
                    </div>
                    <div class="card-actions">${acoes}</div>
                </article>
            `;
        }).join('');
    }

    editar(id) {
        const p = this.pacientes.find(x => x.id === id && !x.arquivado);
        if (!p) return;
        const campos = { 'patient-id': p.id, nome: p.nome, cpf: p.cpf, idade: p.idade, convenio: p.convenio, status: p.status, alergias: p.alergias, exames: p.exames, plano: p.plano };
        Object.entries(campos).forEach(([k, v]) => {
            const el = document.getElementById(k);
            if (el) el.value = v;
        });
        if (this.el.formTitle) this.el.formTitle.textContent = `Atualizar Prontuário (${p.id})`;
        if (this.el.btnSubmit) this.el.btnSubmit.textContent = 'Salvar Alterações';
        this.el.btnCancel?.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    abrirModal(id) {
        const p = this.pacientes.find(x => x.id === id);
        if (!p || !this.el.modal) return;
        const hist = p.historicoEvolucoes.map(h => `
            <div style="border-left:3px solid #0077B6;padding-left:10px;margin-bottom:10px;">
                <p style="margin-bottom:4px;"><strong>${h.dataHora}</strong> — <em>${h.status}</em></p>
                <p style="margin-bottom:4px;"><strong>Exames:</strong> ${h.exames || 'Sem registro nesta evolução'}</p>
                <p style="margin-bottom:0;"><strong>Plano / Observação:</strong> ${h.plano}</p>
            </div>
        `).join('');

        this.el.modalTitulo.textContent = `${p.nome} (${p.id})`;
        this.el.modalBody.innerHTML = `
            <p><strong>CPF:</strong> ${p.cpf} | <strong>Idade:</strong> ${p.idade} anos</p>
            <p><strong>Modalidade:</strong> ${p.convenio} | <strong>Status Clínico:</strong> ${p.status}</p>
            ${p.arquivado ? `<p><strong>Arquivamento:</strong> Arquivado em ${p.arquivadoEm || 'data não informada'} (conforme norma CFM)</p>` : ''}
            <p><strong>Alertas Críticos:</strong> ${p.temAlerta() ? `<span style="color:#E63946;font-weight:700;">${p.alergias}</span>` : 'Sem alergias registradas'}</p>
            <p><strong>Resultados de Exames Atuais:</strong> ${p.exames || 'Sem registros recentes'}</p>
            <p><strong>Plano de Tratamento Atual:</strong> ${p.plano}</p>
            <p><strong>Última Atualização:</strong> ${p.atualizadoEm}</p>
            <hr style="margin:14px 0;border:none;border-top:1px solid #D2E6F0;">
            <p><strong>Histórico de Evoluções e Observações:</strong></p>
            ${hist}
        `;
        this.el.modal.classList.remove('hidden');
    }

    arquivar(id) {
        const p = this.pacientes.find(x => x.id === id && !x.arquivado);
        if (!p || !confirm(`Deseja arquivar o prontuário de ${p.nome} conforme as normas regulatórias do CFM?`)) return;
        p.arquivado = true;
        p.arquivadoEm = Paciente.agora();
        p.atualizadoEm = p.arquivadoEm;
        this.salvar();
        this.renderizar();
        this.feedback('Registro arquivado conforme norma.');
    }

    reativar(id) {
        const p = this.pacientes.find(item => item.id === id && item.arquivado);
        if (!p) return;

        const cpfLimpo = p.cpf.replace(/\D/g, '');
        const conflitoAtivo = this.pacientes.some(
            item => !item.arquivado && item.cpf.replace(/\D/g, '') === cpfLimpo
        );
        if (conflitoAtivo) {
            return this.feedback('Já existe um prontuário ativo com este CPF.', true);
        }

        if (!confirm(`Deseja reativar o prontuário de ${p.nome}?`)) return;

        p.arquivado = false;
        p.arquivadoEm = null;
        p.atualizadoEm = Paciente.agora();
        p.registrarEvolucao({
            status: p.status,
            exames: p.exames,
            plano: 'Prontuário reativado no sistema.',
            dataHora: p.atualizadoEm
        });

        this.salvar();
        this.renderizar();
        this.feedback('Prontuário reativado com sucesso.');
    }

    excluir(id) {
        const p = this.pacientes.find(item => item.id === id && !item.arquivado);
        if (!p) return;

        if (!confirm(`Excluir permanentemente o prontuário de ${p.nome} (${p.id})? Esta ação não pode ser desfeita.`)) return;

        this.pacientes = this.pacientes.filter(item => item.id !== id);
        this.salvar();
        this.renderizar();
        this.feedback('Prontuário excluído do sistema.');
    }

    resetar() {
        this.el.form?.reset();
        const idEl = document.getElementById('patient-id');
        if (idEl) idEl.value = '';
        if (this.el.formTitle) this.el.formTitle.textContent = 'Registrar Novo Paciente';
        if (this.el.btnSubmit) this.el.btnSubmit.textContent = 'Salvar Prontuário';
        this.el.btnCancel?.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => new SistemaLifeCare());