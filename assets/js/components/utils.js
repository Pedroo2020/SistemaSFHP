import { URL_API } from "../urlAPI.js";

// Função para calcular idade
function calcularIdade(dataNascimento) {
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (
        hoje.getMonth() < nasc.getMonth() ||
        (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
    ) {
        idade--;
    }
    return idade;
}

// Função para remover caracteres não numéricos
function getNumber(val) {
    return val.replace(/\D/g, '');
}

// Mostrar mensagem de erro
function alertMsg(msg, type, divMsg) {

    // Obtém a div de mensagem
    const $divMsg = $(divMsg);

    // Cria a div
    const $div = $('<div></div>')
        .addClass(`msg ${type}`);

    // Cria o ícone
    const $icon = $('<i></i>')
        .addClass(`fa-solid ${type === 'error' ? 'fa-xmark' : 'fa-check'}`);

    // Cria o parágrafo
    const $p = $('<p></p>')
        .text(msg);

    // Adiciona cada elemento a seu respectivo pai
    $div.append($icon, $p).appendTo($divMsg);

    $div.on('animationend', () => {
        $div.remove();
    })
}

// Função para desabilitar o scroll
function disabledScroll(body) {
    $(body).css('overflow', 'hidden');
}

// Função para habilitar o scroll
function abledScroll(body) {
    $(body).css('overflow', 'auto');
}

function carregarTotalPacitentes(pacientesText, casosUrgentesText) {
    $.ajax({
        url: `${URL_API}/load_painel`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        success: (res) => {
            // Obtém os usuarios
            const totalPacientes = res.total_pacientes;
            const casosUrgentes = res.casos_urgentes;

            // Mostra o total de pacientes
            pacientesText.text(totalPacientes);
            casosUrgentesText.text(casosUrgentes);
        },
    });
}

export { calcularIdade, getNumber, alertMsg, disabledScroll, abledScroll, carregarTotalPacitentes };