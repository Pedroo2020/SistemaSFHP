// Importa a URL da API
import { URL_API, socket } from "./urlAPI.js";
// Funções para formatar
import { formatarNumeroCPF, formatarNumeroTelefone, formatarPressaoArterial } from "./components/format.js";
// Função para calcular idade
import { calcularIdade, alertMsg, abledScroll, disabledScroll } from './components/utils.js'

// Chama ao carregar a página
$(document).ready(function () {
    carregarDadosUser();
    carregarDadosTriagem();
});

// Botão de voltar
$('.btn-voltar').click(() => {
    // Redireciona para perfil do enfermeiro
    window.location.href = 'medico-perfil.html';
})

const sexos = {
    1: "Masculino",
    2: "Feminino"
};

// Função para carregar os usuários
function carregarDadosUser() {
    const urlParams = new URLSearchParams(window.location.search);
    const cpf = urlParams.get("cpf");

    if (!cpf) {
        console.warn("CPF não informado na URL.");
        return;
    }

    $.ajax({
        url: `${URL_API}/cadastro`,
        method: "GET",
        data: { cpf: cpf },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        success: (res) => {

            const user = res.user;

            // ===== Preenche os campos =====
            $("#nome-paciente").text(user.nome);
            $("#cpf-paciente").text(formatarNumeroCPF(user.cpf));
            $("#telefone-paciente").text(formatarNumeroTelefone(user.telefone));
            $("#sexo-paciente").text(sexos[user.sexo]);

            // Idade
            const idade = calcularIdade(user.data_nascimento);
            $("#idade-paciente").text(idade ? idade + " anos" : "—");
        },
        error: (err) => {
            if (err.responseJSON?.logout) {
                localStorage.clear();
                localStorage.setItem("msg-logout", err.responseJSON.error);
                return window.location.href = "index.html";
            }

            alertMsg("Erro ao carregar usuário.", "error", "#div-msg-modal");
        }
    });
}

// Função para carregar os dados da triagem
function carregarDadosTriagem() {
    const urlParams = new URLSearchParams(window.location.search);
    const cpf = urlParams.get("cpf");

    if (!cpf) {
        console.warn("CPF não informado na URL.");
        return;
    }

    $.ajax({
        url: `${URL_API}/triagem`,
        method: "GET",
        data: { cpf: cpf },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        success: (res) => {
            const triagem = res.triagem;

            if (!triagem) {
                console.warn("Nenhum dado de triagem encontrado.");
                return;
            }

            // ===== Preenche os campos =====
            $("#queixa-principal").text(triagem.queixa);
            $("#temperatura-paciente").text(triagem.temperatura ? triagem.temperatura + " °C" : "—");
            $("#pressao-arterial-paciente").text(formatarPressaoArterial(triagem.pressao || "—"));
            $("#frequencia-cardiaca-paciente").text(triagem.frequencia_cardiaca ? triagem.frequencia_cardiaca + " bpm" : "—");
            $("#saturacao-oxigenio-paciente").text(triagem.saturacao ? triagem.saturacao + "%" : "—");
            $("#nivel_dor").text(triagem.nivel_dor || "—");
            $("#alegias-paciente").text(triagem.alergia || "—");
            $("#medicamentos-uso-paciente").text(triagem.medicamento_uso || "—");

            var a = ['', 'Leve', 'Pouco urgente', 'Urgente', 'Muito Urgente', 'Risco de vida']

            var div = criarEtiquetaPrioridade(a[triagem.classificacao_risco])
            $("#prioridade").html(div)

        },
        error: (err) => {
            if (err.responseJSON?.logout) {
                localStorage.clear();
                localStorage.setItem("msg-logout", err.responseJSON.error);
                return window.location.href = "index.html";
            }

            alertMsg("Erro ao carregar dados da triagem.", "error", "#div-msg-modal");
        }
    });
}

// Função para criar a etiqueta de prioridade
function criarEtiquetaPrioridade(prioridade) {
    // Cria a div principal
    const div = $('<div></div>').addClass('etiqueta-prioridade');

    // Adiciona a cor de fundo conforme a prioridade
    if (prioridade === 'Leve') {
        div.addClass('leve');
    } else if (prioridade === 'Pouco urgente') {
        div.addClass('pouco-urgente');
    } else if (prioridade === 'Urgente') {
        div.addClass('urgente');
    } else if (prioridade === 'Muito urgente') {
        div.addClass('muito-urgente');
    } else if (prioridade === 'Risco de vida') {
        div.addClass('risco-vida');
    }

    // Cria o elemento de texto
    const p = $('<p></p>').text(prioridade);

    // Adiciona o p a div
    div.append(p);

    // Retorna a etiqueta
    return div;
}

// Função para focar um input / textarea
function focusInput(input) {
    $(input)
        .css({
            'outline': 'var(--red-base)',
            'border-color': 'var(--red-base)'
        })
        .focus();
}

// Função para desfocar um input / textarea
function unfocusInput(input) {
    $(input)
        .css({
            'outline': 'var(--blue-dark)',
            'border-color': 'var(--gray-300)'
        })
}

// Função para marcar em vermelho input vazio
function showInputEmpty() {

    // Obtém a textarea
    const diagnostico = $('#diagnostico');

    // Verifica se está vazio
    if (!diagnostico.val().trim('')) {

        // Borda em vermelha e foca a text area
        focusInput(diagnostico);

        // Evento input para a textarea
        diagnostico.on('input', function () {
            // Desfoca o input caso esteja preenchido
            if ($(diagnostico).val().trim('')) {
                unfocusInput($(diagnostico));
            }
        })

        return;
    }

    // Desfoca a textarea
    unfocusInput(diagnostico);

    // Obtém a textarea
    const receita = $('#receita');

    // Verifica se está vazio
    if (!receita.val().trim('')) {

        // Borda em vermelha e foca a text area
        focusInput(receita);

        // Evento input para a textarea
        receita.on('input', function () {
            // Desfoca o input caso esteja preenchido
            if ($(receita).val().trim('')) {
                unfocusInput($(receita));
            }
        })

        return;
    }

    // Desfoca a textarea
    unfocusInput(receita);
}

// Função para enviar formulário
$('.formulario-container').on('submit', function (e) {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtém o token
    const token = localStorage.getItem('token');

    // Redireciona para login
    if (!token) {
        localStorage.clear();
        return window.location.href = 'index.html';
    }

    // Obtém os parâmetros
    const params = new URLSearchParams(window.location.search);

    // Obtém o CPF do usuário
    const cpf = params.get('cpf');

    // Cria o objeto form
    const formData = new FormData(this);

    // Cria o objeto data da requisição
    const data = {
        diagnostico: formData.get('diagnostico'),
        receita: formData.get('receita'),
        cpf: cpf
    }

    // Requisição triagem (POST)
    $.ajax({
        url: `${URL_API}/diagnostico`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data),
        success: (res) => {
            // Salva a mensagem
            localStorage.setItem('diagnostico-cadastrado', res.success);

            // Redireciona para a página do enfermeiro
            return window.location.href = 'medico-perfil.html';
        },
        error: (err) => {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Mostra o input vazio
            showInputEmpty();

            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})