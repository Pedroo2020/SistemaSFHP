import { URL_API } from './urlAPI.js';
import { formatarMinutos } from './components/format.js';
import alertMsg from './alertMsg.js';

// Carrega a tabela ao carregar a página
$(document).ready(async () => {

    // Carrega as consultas na fase de entrada
    await carregarConsultas(false, 1);

    // Obtém a mensagem
    const msg = localStorage.getItem('triagem-cadastrada');

    if (msg) {
        // Remove a mensagem
        localStorage.removeItem('triagem-cadastrada');
        // Exibe a mensagem
        alertMsg(msg, 'success', '#div-msg')
    }

})

// Ao clicar no botão, atualiza as consultas
$('#refresh-consultas').on('click', async () => {
    // Adiciona a animação de girar ao botão
    $('#refresh-icon').addClass('refreshing');
    
    // Recarregar consultas
    await recarregarConsultas();

    // Remove a animação de girar ao botão
    $('#refresh-icon').removeClass('refreshing');
});

// Função para recarrregar consultas com a situação atual
function recarregarConsultas() {
    // Declara a variável
    let situacao;

    // Percorre todos os elementos do filtro consulta
    $('.filtro-consulta').each((_, item) => {
        // Transforma em objeto jquery
        const $item = $(item);

        // Caso o objeto tenha a class active
        if ($item.hasClass('active')) {
            // Atualiza o valor da situação
            return situacao = $item.attr('sit');
        }
    })

    // Caso situação exista, refaz a busca
    if (situacao) {
        carregarConsultas(false, situacao);
    }
}

// Função para carregar consultas
function carregarConsultas(getConsultas, situacao) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${URL_API}/consultas/${situacao}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            success: (res) => {
                const consultas = res.consultas;

                // Retorna a lista de consultas
                if (getConsultas) {
                    resolve(consultas);
                    return;
                }

                // Se não pediu só os dados, preenche tabela
                $('#table-consultas').empty();

                if (consultas.length > 0) {
                    consultas.map((consulta) => addConsulta(consulta));
                } else {
                    const consultasNotFound = $('<tr></tr>')
                        .append($('<td></td>')
                            .text('Nenhum resultado encontrado para essa busca')
                            .addClass('consultas-not-found')
                            .attr('colspan', 6));

                    $('#table-consultas').append(consultasNotFound);
                }

                const dataAtual = new Date();
                const dataFormatada = dataAtual.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });

                $('.last-att').text(`Última atualização: ${dataFormatada}`);
                resolve(); // retorna vazio só pra indicar que terminou
            },
            error: (err) => {
                console.log(err);
                reject(err);
            }
        });
    });
}

// Função para adicionar os dados a tabela
function addConsulta(consulta) {
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

    const entrada = $('<td></td>')
        .text(consulta.data_entrada)
        .addClass('td-time')

    const tempoDecorrido = $('<td></td>')
        .text(formatarMinutos(consulta.tempo_decorrido))
        .addClass('td-time')

    // Ícone de ação
    const iconeMoreDetails = $('<i></i>').addClass('fa-solid fa-ellipsis icon-more-details');
    const iconAcao = $('<td></td>')
        .append(iconeMoreDetails)
        .addClass('td-time')

    // Adiciona os elementos ao tr
    $tr
        .append(posicao)
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(entrada)
        .append(tempoDecorrido)
        .append(iconAcao)

    // Adiciona ao tbody
    $tbody.append($tr);
}

// Função para desabilitar o scroll
function disabledScroll() {
    $(document.body).css('overflow', 'hidden');
}

// Função para habilitar o scroll
function abledScroll() {
    $(document.body).css('overflow', 'auto');
}

// Obtém os botões
const botaoNovoPaciente = $('.btn-novo-paciente');
const modal = $('#modalNovoPaciente');
const fechar = $('#fechar-modal');
const formTriagem = $('#form-triagem');
const selectPaciente = $('#paciente-triagem');

// Abre o modal de novo paciente
botaoNovoPaciente.click(async () => {
    modal.css('display', 'flex');
    formTriagem.css('display', 'flex');

    // Limpa o select
    selectPaciente.empty();

    // Obtém os pacientes da consulta
    const consultas = await carregarConsultas(true, 1);

    // Cria as options de consulta
    consultas.map((consulta, index) => {
        // Cria o objeto
        const option = $('<option></option>')
            .val(consulta.cpf)
            .attr('entrada',consulta.data_entrada)
            .attr('posicao', consulta.posicao)
            .text(consulta.nome);

        // Adiciona ao select
        selectPaciente.append(option);

        // Altera os dados da entrada e posição caso seja index 0
        if (index === 0) {
            // Atualiza o horário de entrada
            $('.time-entrada').text(`Entrada: ${consulta.data_entrada}`);
            $('.posicao').text(`Posição: ${consulta.posicao}°`)
        }
    })

    // Desabilita o scroll
    disabledScroll();
});

// Ao alterar o valor do select
selectPaciente.on('change', () => {

    // Obtém os elementos option dentro do select
    const options = selectPaciente.find('option')

    // Declara a variável
    let entrada;
    let posicao;

    // Percorre todos os elementos
    options.each((index, option) => {
        // Transforma em objeto jquery
        const $option = $(option);

        // Caso o valor da option seja igual ao valor do select atual
        if ($option.val() == selectPaciente.val()) {
            // Armazena o horário de entrada
            entrada = $option.attr('entrada');
            posicao = $option.attr('posicao');
        }
    })

    // Atualiza o horário de entrada
    $('.time-entrada').text(`Entrada: ${entrada}`);
    $('.posicao').text(`Posição: ${posicao}°`)
})

// Fecha o modal de novo paciente
fechar.click(() => {
    modal.hide();

    // Habilita o scroll
    abledScroll();
});

// Form de iniciar a triagem
$('#form-triagem').on('submit', (e) => {
    // Evita comportamento padrão
    e.preventDefault();

    // Obtém o token
    const token = localStorage.getItem('token');

    if (!token) {
        // limpa o local storage
        localStorage.clear();
        // Redireciona para login
        return window.location.href = "index.html";
    }

    // Obtém os elementos option dentro do select
    const cpfPaciente = selectPaciente.val();

    // Faz a requisição
    $.ajax({
        url: `${URL_API}/start_triagem`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify({
            cpf: cpfPaciente
        }),
        success: (res) => {
            // Cria a url passado CPF como parâmetro
            let newUrl = `triagem.html?cpf=${encodeURIComponent(cpfPaciente)}`;

            // Redireciona para triagem
            return window.location.href = newUrl;
        },
        error: (err) => {
            console.log(err)
        }
    })
})

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

            // Obtém a situação do filtro
            const situacao = $item.attr('sit');
            
            // Carrega as consultas
            carregarConsultas(false, situacao);

            // Adiciona a class active
            return $item.addClass('active');
        })
    })
    
})