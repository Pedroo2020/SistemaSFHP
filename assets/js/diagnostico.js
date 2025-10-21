// Importa a URL da API
import { URL_API, socket } from "./urlAPI.js";
// Funções para formatar
import { formatarNumeroCPF, formatarNumeroTelefone, formatarPressaoArterial } from "./components/format.js";
// Função para calcular idade
import { calcularIdade, alertMsg, abledScroll, disabledScroll } from './components/utils.js'


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

// Chama ao carregar a página
$(document).ready(function () {
    carregarDadosUser();
    carregarDadosTriagem();
});


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