import { URL_API } from "../urlAPI.js";
import { formatarTempo } from "./format.js";

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

// Obter data de hoje
function getToday() {
    // Cria um objeto date
    const date = new Date();

    // Obtém ano, mes e dia
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // meses começam em 0
    const dia = String(date.getDate()).padStart(2, '0');

    // Cria a string da data formatada
    return `${ano}-${mes}-${dia}`;
}

// Função para pegar a data de hoje
function getTodayInputDate(inputDateStart, inputDateEnd) {

    const hoje = getToday();

    // Atualiza os valores do input para hoje
    inputDateEnd.val(hoje);
    inputDateStart.val(hoje);
}

// Função para carregar total de pacientes e o total de casos urgentes
function carregarTotalPacitentes(blocoUmText, blocoDoisText, tempoMedioText, dateStart, dateEnd, isAdm) {

    // Promise para funcionar o await
    return new Promise((resolve, reject) => {
        // Cria o objeto url
        const url = new URLSearchParams();

        // Define os parâmetros i (início) e f (fim)

        // VALOR FIXO NO CÓDIGO
        url.set('i', dateStart);
        url.set('f', dateEnd);

        // Faz a requisição
        $.ajax({
            url: `${URL_API}/load_painel?${url}`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            success: (res) => {

                if (!isAdm) {
                    // Obtém os usuarios
                    const casosUrgentes = res.casos_urgentes;

                    // Mostra o total de pacientes
                    blocoDoisText.text(casosUrgentes);
                } else {
                    // Obtém os usuarios
                    const totalConsultas = res.total_consultas;

                    // Mostra o total de pacientes
                    blocoDoisText.text(totalConsultas);
                }

                // Carrega o total de pacientes e tempo médio de espera
                const tempoMedio = res.tempo_medio;
                const totalPacientes = res.total_pacientes;

                tempoMedioText.text(formatarTempo(tempoMedio));
                blocoUmText.text(totalPacientes);

                // Resolve a promise
                resolve();
            },
            error: (err) => {
                console.log(err);
                reject(err);
            }
        });
    })
}

export { calcularIdade, getNumber, alertMsg, disabledScroll, abledScroll, getTodayInputDate, getToday, carregarTotalPacitentes };