// Importa a URL da API
import { URL_API } from './urlAPI.js';
// Função para mostrar mensagens de alerta
import { alertMsg } from './components/utils.js';


// Filtro da consulta
$('.filtro-consulta').each((_, element) => {
    // Transforma em objeto jquery
    const $element = $(element);

    // Função on click
    $element.on('click', function () {
        // Percorre todos os elementos do filtro consulta
        $('.filtro-consulta').each((_, item) => {
            // Transforma em objeto jquery
            const $item = $(item);

            // Verifica se o objeto é diferente do objeto clicado
            if ($item[0] !== this) {
                // Remove a class active
                return $item.removeClass('active');
            }

            // Adiciona a class active
            return $item.addClass('active');
        })
    })

})


// Função para adicionar os dados a tabela
function addConsulta(consulta, situacao) {
    // tbody
    const $tbody = $('#table-consultas');

    // Cria a <tr></tr> 
    const $tr = $('<tr></tr>');

    // Cria as tds
    const posicao = $('<td></td>')
        .text(`${consulta.posicao}°`)
        .addClass('td-numero')

    const nome = $('<td></td>')
        .text(consulta.nome)
        .addClass('td-string')

    const idade = $('<td></td>')
        .text(consulta.idade)
        .addClass('td-numero')

    const sexo = $('<td></td>')
        .text(consulta.sexo)
        .addClass('td-string')

    const prioridade = $('<td></td>')
      .text(consulta.prioridade)
      .addClass('td-time')

    const entrada = $('<td></td>')
        .text(consulta.data_entrada)
        .addClass('td-time')

    const tempoDecorrido = $('<td></td>')
        .text(formatarMinutos(consulta.tempo_decorrido))
        .addClass('td-time')

    // Ícone de ação
    const iconeMoreDetails = $('<i></i>')
        .addClass('fa-solid fa-ellipsis icon-more-details');

    const iconAcao = $('<td></td>')
        .append(iconeMoreDetails)
        .attr('cpf', consulta.cpf)
        .addClass('td-time')
        .addClass(situacao == 1 ? 'details-entrada' : situacao == 2 ? 'details-triagem' : '') // muda a class conforme a situação;

    // Adiciona os elementos ao tr
    $tr
        .append(posicao)
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(prioridade)
        .append(entrada)
        .append(tempoDecorrido)
        .append(iconAcao)

    // Adiciona ao tbody
    $tbody.append($tr);
}