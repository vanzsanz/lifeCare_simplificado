// ============================================================================
// SISTEMA DE CADASTRO DE PACIENTES - JAVASCRIPT DIDÁTICO
// Feito para fácil leitura e explicação em apresentações acadêmicas.
// ============================================================================

// 1. DADOS DA APLICAÇÃO
// Buscamos os pacientes salvos no navegador (localStorage).
// Se não houver nada salvo ainda, criamos uma lista vazia [].
let pacientes = JSON.parse(localStorage.getItem("lista_pacientes")) || [
  { nome: "Ana Carolina Santos", cpf: "123.456.789-00", telefone: "(11) 98765-4321", nascimento: "1995-05-12", alergias: "Dipirona" },
  { nome: "Carlos Eduardo Silva", cpf: "987.654.321-11", telefone: "(21) 91234-5678", nascimento: "1988-10-20", alergias: "Nenhuma" }
];

// Variável que guarda a posição do paciente que estamos editando.
// Se for -1, significa que estamos cadastrando um NOVO paciente.
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

// 3. FUNÇÃO PARA SALVAR NO NAVEGADOR
// Converte a lista de pacientes para texto (JSON) e grava no localStorage.
function salvarNoLocalStorage() {
  localStorage.setItem("lista_pacientes", JSON.stringify(pacientes));
}

// 4. FUNÇÃO PARA EXIBIR OS PACIENTES NA TABELA (RENDERIZAÇÃO)
function exibirPacientes(lista = pacientes) {
  // Limpa o conteúdo atual da tabela para redesenhar
  tabelaCorpo.innerHTML = "";

  // Atualiza o contador de total de pacientes
  contadorTotal.textContent = lista.length;

  // Se a lista estiver vazia, exibe uma mensagem
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

  // Percorre cada paciente da lista e cria as linhas da tabela
  lista.forEach((paciente, index) => {
    // Cria uma nova linha <tr>
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

    // Adiciona a linha na tabela HTML
    tabelaCorpo.appendChild(tr);
  });
}

// 5. FUNÇÃO PARA FORMATAR A DATA (ANO-MES-DIA para DIA/MES/ANO)
function formatarData(dataAmericana) {
  if (!dataAmericana) return "—";
  const partes = dataAmericana.split("-"); // divide em [ano, mes, dia]
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// 6. EVENTO DE ENVIO DO FORMULÁRIO (CADASTRAR OU ATUALIZAR)
form.addEventListener("submit", function (evento) {
  // Evita que a página seja recarregada ao enviar o formulário
  evento.preventDefault();

  // Cria um objeto com os dados digitados
  const dadosPaciente = {
    nome: inputNome.value.trim(),
    cpf: inputCpf.value.trim(),
    telefone: inputTelefone.value.trim(),
    nascimento: inputNascimento.value,
    alergias: inputAlergias.value.trim()
  };

  // Se estivermos editando, atualiza a posição existente
  if (indiceEdicao >= 0) {
    pacientes[indiceEdicao] = dadosPaciente;
    indiceEdicao = -1; // Volta ao modo normal
    btnSalvar.textContent = "Cadastrar Paciente";
    btnCancelar.style.display = "none";
    alert("Paciente atualizado com sucesso!");
  } else {
    // Se não, adiciona um novo paciente no final da lista
    pacientes.push(dadosPaciente);
    alert("Paciente cadastrado com sucesso!");
  }

  // Grava as alterações no navegador e redesenha a tabela
  salvarNoLocalStorage();
  exibirPacientes();

  // Limpa todos os campos do formulário
  form.reset();
});

// 7. FUNÇÃO PARA CARREGAR DADOS NO FORMULÁRIO (MODO EDIÇÃO)
function carregarParaEditar(index) {
  const paciente = pacientes[index];

  // Preenche os inputs com os dados do paciente selecionado
  inputNome.value = paciente.nome;
  inputCpf.value = paciente.cpf;
  inputTelefone.value = paciente.telefone;
  inputNascimento.value = paciente.nascimento;
  inputAlergias.value = paciente.alergias;

  // Ativa o estado de edição
  indiceEdicao = index;
  btnSalvar.textContent = "Salvar Alterações";
  btnCancelar.style.display = "inline-block";

  // Rola até o formulário e foca no primeiro campo
  window.scrollTo({ top: 0, behavior: "smooth" });
  inputNome.focus();
}

// 8. CANCELAR O MODO DE EDIÇÃO
btnCancelar.addEventListener("click", function () {
  indiceEdicao = -1;
  form.reset();
  btnSalvar.textContent = "Cadastrar Paciente";
  btnCancelar.style.display = "none";
});

// 9. FUNÇÃO PARA EXCLUIR UM PACIENTE
function excluirPaciente(index) {
  const confirmacao = confirm("Deseja realmente excluir este paciente?");
  if (confirmacao) {
    // splice remove 1 elemento a partir da posição 'index'
    pacientes.splice(index, 1);

    // Salva a nova lista e redesenha a tabela
    salvarNoLocalStorage();
    exibirPacientes();
    alert("Paciente excluído!");
  }
}

// 10. BUSCA EM TEMPO REAL POR NOME OU CPF
campoBusca.addEventListener("input", function () {
  const termo = campoBusca.value.toLowerCase();

  // Filtra os pacientes que possuem o termo no nome ou no CPF
  const filtrados = pacientes.filter(function (p) {
    return p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo);
  });

  // Exibe somente os que passaram no filtro
  exibirPacientes(filtrados);
});

// 11. INICIALIZAÇÃO AUTOMÁTICA AO CARREGAR A PÁGINA
exibirPacientes();
