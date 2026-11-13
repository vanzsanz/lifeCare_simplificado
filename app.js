// ============================================================================
// SISTEMA DE CADASTRO DE PACIENTES - COM VALIDAÇÕES COMPLETAS
// ============================================================================

// 1. DADOS DA APLICAÇÃO
let pacientes = JSON.parse(localStorage.getItem("lista_pacientes")) || [
  { nome: "Ana Carolina Santos", cpf: "123.456.789-00", telefone: "(11) 98765-4321", nascimento: "1995-05-12", alergias: "Dipirona" },
  { nome: "Carlos Eduardo Silva", cpf: "987.654.321-11", telefone: "(21) 91234-5678", nascimento: "1988-10-20", alergias: "Nenhuma" }
];

let indiceEdicao = -1;

// 2. CAPTURA DOS ELEMENTOS DO HTML (DOM)
const form = document.getElementById("formPaciente");
const inputNome = document.getElementById("nome");
const inputCpf = document.getElementById("cpf");
const inputTelefone = document.getElementById("telefone");
const inputNascimento = document.getElementById("nascimento");
const inputAlergias = document.getElementById("alergias");

const tabelaCorpo = document.getElementById("tabelaPacientesCorpo");
const contadorTotal = document.getElementById("totalPacientes");
const campoBusca = document.getElementById("campoBusca");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");

// 3. FUNÇÕES DE FORMATAÇÃO E MÁSCARA AUTOMÁTICA EM TEMPO REAL
inputCpf.addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);
  
  if (valor.length > 9) {
    valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*$/, "$1.$2.$3-$4");
  } else if (valor.length > 6) {
    valor = valor.replace(/^(\d{3})(\d{3})(\d{1,3}).*$/, "$1.$2.$3");
  } else if (valor.length > 3) {
    valor = valor.replace(/^(\d{3})(\d{1,3}).*$/, "$1.$2");
  }
  e.target.value = valor;
});

inputTelefone.addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);

  if (valor.length > 10) {
    valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*$/, "($1) $2-$3");
  } else if (valor.length > 6) {
    valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*$/, "($1) $2-$3");
  } else if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d{0,5}).*$/, "($1) $2");
  } else if (valor.length > 0) {
    valor = valor.replace(/^(\d{0,2}).*$/, "($1");
  }
  e.target.value = valor;
});

// 4. FUNÇÕES DE VALIDAÇÃO RIGOROSA

// Validação de CPF (Algoritmo Oficial de Dígitos Verificadores)
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// Validação de Telefone (Exige DDD válido e 8 ou 9 dígitos)
function validarTelefone(telefone) {
  const telLimpo = telefone.replace(/\D/g, "");
  // Formato aceito: DDD (2 dígitos) + 8 ou 9 dígitos (total 10 ou 11)
  const regexTelefone = /^[1-9]{2}(9[0-9]{8}|[2-9][0-9]{7})$/;
  return regexTelefone.test(telLimpo);
}

// Validação de Data de Nascimento (Verifica se é data real, não é futura e não excede 120 anos)
function validarDataNascimento(dataStr) {
  if (!dataStr) return false;
  
  const partes = dataStr.split("-");
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const dataNasc = new Date(ano, mes, dia);
  const hoje = new Date();

  // Confere se a data é válida de fato (ex: evita 31/02)
  if (
    dataNasc.getFullYear() !== ano ||
    dataNasc.getMonth() !== mes ||
    dataNasc.getDate() !== dia
  ) {
    return false;
  }

  // Verifica se está no futuro ou se a pessoa teria mais de 120 anos
  const anoMinimo = hoje.getFullYear() - 120;
  if (dataNasc > hoje || ano < anoMinimo) {
    return false;
  }

  return true;
}

// 5. FUNÇÃO PARA SALVAR NO NAVEGADOR
function salvarNoLocalStorage() {
  localStorage.setItem("lista_pacientes", JSON.stringify(pacientes));
}

// 6. FUNÇÃO PARA EXIBIR OS PACIENTES NA TABELA (RENDERIZAÇÃO)
function exibirPacientes(lista = pacientes) {
  tabelaCorpo.innerHTML = "";
  contadorTotal.textContent = lista.length;

  if (lista.length === 0) {
    tabelaCorpo.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 25px; color: #64748b;">
          Nenhum paciente encontrado.
        </td>
      </tr>
    `;
    return;
  }

  lista.forEach((paciente, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${paciente.nome}</strong></td>
      <td>${paciente.cpf}</td>
      <td>${paciente.telefone}</td>
      <td>${formatarData(paciente.nascimento)}</td>
      <td><span class="badge-alergia">${paciente.alergias || "Nenhuma"}</span></td>
      <td style="text-align: right;">
        <button class="btn-tabela btn-editar" onclick="carregarParaEditar(${index})">Editar</button>
        <button class="btn-tabela btn-excluir" onclick="excluirPaciente(${index})">Excluir</button>
      </td>
    `;

    tabelaCorpo.appendChild(tr);
  });
}

// 7. FUNÇÃO PARA FORMATAR A DATA (ANO-MES-DIA para DIA/MES/ANO)
function formatarData(dataAmericana) {
  if (!dataAmericana) return "—";
  const partes = dataAmericana.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// 8. EVENTO DE ENVIO DO FORMULÁRIO COM VALIDAÇÕES APLICADAS
form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nomeValor = inputNome.value.trim();
  const cpfValor = inputCpf.value.trim();
  const telValor = inputTelefone.value.trim();
  const nascValor = inputNascimento.value;
  const alergiasValor = inputAlergias.value.trim();

  // Validações em lote
  let erros = [];

  if (nomeValor.length < 3) {
    erros.push("O nome completo deve conter pelo menos 3 caracteres.");
  }

  if (!validarCPF(cpfValor)) {
    erros.push("O CPF informado é inválido. Verifique os dígitos.");
  }

  if (!validarTelefone(telValor)) {
    erros.push("O telefone informado é inválido. Inclua o DDD corretamente (ex: 11 99999-9999).");
  }

  if (!validarDataNascimento(nascValor)) {
    erros.push("A data de nascimento é inválida, está no futuro ou excede o limite histórico.");
  }

  // Se houver erros, interrompe o cadastro e avisa o usuário
  if (erros.length > 0) {
    alert("Por favor, corrija os seguintes erros:\n\n• " + erros.join("\n• "));
    return;
  }

  const dadosPaciente = {
    nome: nomeValor,
    cpf: cpfValor,
    telefone: telValor,
    nascimento: nascValor,
    alergias: alergiasValor
  };

  // Verifica duplicação de CPF (exceto se for o próprio registro em edição)
  const cpfLimpo = cpfValor.replace(/\D/g, "");
  const cpfDuplicado = pacientes.some((p, idx) => {
    return p.cpf.replace(/\D/g, "") === cpfLimpo && idx !== indiceEdicao;
  });

  if (cpfDuplicado) {
    alert("Atenção: Já existe um paciente cadastrado com este mesmo CPF.");
    return;
  }

  // Atualização ou Cadastro Novo
  if (indiceEdicao >= 0) {
    pacientes[indiceEdicao] = dadosPaciente;
    indiceEdicao = -1;
    btnSalvar.textContent = "Cadastrar Paciente";
    btnCancelar.style.display = "none";
    alert("Paciente atualizado com sucesso!");
  } else {
    pacientes.push(dadosPaciente);
    alert("Paciente cadastrado com sucesso!");
  }

  salvarNoLocalStorage();
  exibirPacientes();
  form.reset();
});

// 9. FUNÇÃO PARA CARREGAR DADOS NO FORMULÁRIO (MODO EDIÇÃO)
function carregarParaEditar(index) {
  const paciente = pacientes[index];

  inputNome.value = paciente.nome;
  inputCpf.value = paciente.cpf;
  inputTelefone.value = paciente.telefone;
  inputNascimento.value = paciente.nascimento;
  inputAlergias.value = paciente.alergias;

  indiceEdicao = index;
  btnSalvar.textContent = "Salvar Alterações";
  btnCancelar.style.display = "inline-block";

  window.scrollTo({ top: 0, behavior: "smooth" });
  inputNome.focus();
}

// 10. CANCELAR O MODO DE EDIÇÃO
btnCancelar.addEventListener("click", function () {
  indiceEdicao = -1;
  form.reset();
  btnSalvar.textContent = "Cadastrar Paciente";
  btnCancelar.style.display = "none";
});

// 11. FUNÇÃO PARA EXCLUIR UM PACIENTE
function excluirPaciente(index) {
  const confirmacao = confirm("Deseja realmente excluir este paciente?");
  if (confirmacao) {
    pacientes.splice(index, 1);
    salvarNoLocalStorage();
    exibirPacientes();
    alert("Paciente excluído!");
  }
}

// 12. BUSCA EM TEMPO REAL POR NOME OU CPF
campoBusca.addEventListener("input", function () {
  const termo = campoBusca.value.toLowerCase();
  const filtrados = pacientes.filter(function (p) {
    return p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo);
  });
  exibirPacientes(filtrados);
});

// 13. INICIALIZAÇÃO AUTOMÁTICA AO CARREGAR A PÁGINA
exibirPacientes();