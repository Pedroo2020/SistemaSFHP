// Função para formatar CPF
import { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone, formatarMinutos } from './components/format.js';
import { socket, URL_API } from './urlAPI.js';
import alertMsg from './alertMsg.js';

// Ao carregar a página, adiciona as formatações ao input
$(document).ready(() => {
    formatCPF('#input-cpf');
})

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
const voltarParaCPF = $('#voltar-cpf');
const formCPF = $('#form-cpf');
const formCadastro = $('#form-cadastro');
const formConsulta = $('#form-consulta');

// Abre o modal de novo paciente
botaoNovoPaciente.click(() => {
    modal.css('display', 'flex');
    formCPF.css('display', 'flex');

    // Desabilita o scroll
    disabledScroll();
});

// Fecha o modal de novo paciente
fechar.click(() => {
    modal.hide();

    // Habilita o scroll
    abledScroll();
});

// Volta para a tela de inserir CPF
voltarParaCPF.click(() => {
    // Altera o form visível
    formCadastro.hide();
    formConsulta.hide();
    formCPF.css('display', 'flex');

    // Altera o botão de voltar
    fechar.show();
    voltarParaCPF.hide();
});

// Busca pelos dados do usuário
formCPF.on('submit', ((e) => {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtem o CPF formatado e apenas dígitos
    const cpf = $('#input-cpf').val();
    const cpfOnlyNumber = cpf.replace(/\D/g, '');

    // Altera o botão de voltar
    fechar.hide();
    voltarParaCPF.show();

    // Requisição e lógica para validar cpf
    $.ajax({
        url: `${URL_API}/cadastro?cpf=${cpfOnlyNumber}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: (res) => {
            // Exibe mensagem de erro
            alertMsg('Usuário encontrado.', 'success', '#div-msg-modal');

            // Obtém os dados do usuário
            const user = res.user;

            // Preenche o input com o cpf do usuário
            $('#cpf-consulta').val(cpf);

            // Exibe o form de cadastro de consulta
            formCPF.hide();
            formConsulta.css('display', 'flex');

            // Preenche os dados do usuário
            $('#nome-consulta').val(user.nome);
            $('#sus-consulta').val(formatarNumeroSUS(user.coren_crm_sus));
            $('#email-consulta').val(user.email);
            $('#telefone-consulta').val(formatarNumeroTelefone(user.telefone));
            $('#sexo-consulta').val(user.sexo === 1 ? 'masculino' : 'feminino');
            $('#nascimento-consulta').val(new Date(user.data_nascimento).toISOString().split('T')[0]);

            // Formata o input de telefone e número do sus
            formatTelefone('#telefone-consulta', user.telefone);
            formatSUS('#sus-consulta', user.coren_crm_sus);

        },
        error: (err) => {

            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');

            // Caso o CPF seja válido mas o usuário não seja encontrado
            if (err.responseJSON.userNotFound) {
                // Preenche o input com o cpf do usuário
                $('#cpf-cadastro').val(cpf);
                // Formata o input de CPF
                formatCPF('#cpf-cadastro', cpfOnlyNumber);
                formatTelefone('#telefone-cadastro');
                formatSUS('#sus-cadastro');

                // Torna visível o form de cadastro
                formCPF.hide();
                formCadastro.css('display', 'flex');
            }

        }
    })
}))

// Cadastrar usuário
formCadastro.on('submit', function (e) {
    // Evita comportamento padrão
    e.preventDefault();

    // Formata os dados
    const form = new FormData(this);

    const data = {
        nome: form.get('nome-cadastro'),
        email: form.get('email-cadastro'),
        telefone: form.get('telefone-cadastro').replace(/\D/g, ''),
        cpf: form.get('cpf-cadastro').replace(/\D/g, ''),
        coren_crm_sus: form.get('sus-cadastro').replace(/\D/g, ''), // String
        sexo: form.get('sexo-cadastro') === 'masculino' ? 1 : 2,
        nascimento: form.get('nascimento-cadastro'),
        tipo_usuario: 5
    }

    $.ajax({
        url: `${URL_API}/cadastro`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'Application/json',
        data: JSON.stringify(data),
        success: (res) => {
            // Exibe mensagem de sucesso
            alertMsg(res.success, 'success', '#div-msg-modal');

            // Preenche os dados do usuário
            $('#cpf-consulta').val(form.get('cpf-cadastro'));
            $('#nome-consulta').val(data.nome);
            $('#sus-consulta').val(formatarNumeroSUS(data.coren_crm_sus));
            $('#email-consulta').val(data.email);
            $('#telefone-consulta').val(formatarNumeroTelefone(data.telefone));
            $('#sexo-consulta').val(data.sexo === 1 ? 'masculino' : 'feminino');
            $('#nascimento-consulta').val(data.nascimento);

            // Formata os inputs de telefone e número do sus 
            formatTelefone('#telefone-consulta', data.telefone);
            formatSUS('#sus-consulta', data.coren_crm_sus);

            // Exibe o form de cadastro de consulta
            formCadastro.hide();
            formCadastro[0].reset();
            formConsulta.css('display', 'flex');
        },
        error: (err) => {
            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
})

// Form de cadastro de consulta
formConsulta.on('submit', function (e) {
    // Previne o evento padrão do navegador
    e.preventDefault();

    // Cria o objeto data
    const data = {
        situacao: 1,
        cpf: $('#cpf-consulta').val().replace(/\D/g, ''),
    }

    $.ajax({
        url: `${URL_API}/consulta`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'Application/json',
        data: JSON.stringify(data),
        success: (res) => {
            // Fecha o modal e habilita o scroll
            modal.hide();
            formConsulta.hide();
            abledScroll();

            // Reseta os valores dos forms
            formConsulta[0].reset();
            formCPF[0].reset();

            // Atualiza as consultas
            carregarConsultas();

            // Exibe mensagem de sucesso
            alertMsg(res.success, 'success', '#div-msg');
        },
        error: (err) => {
            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
})

// Carrega a tabela ao carregar a página
$(document).ready(async () => {
    
    await carregarConsultas();

})

// Ao clicar no botão, atualiza as consultas
$('#refresh-consultas').on('click', carregarConsultas);

// Função para carregar consultas
function carregarConsultas() {
    $.ajax({
        url: `${URL_API}/consultas`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: (res) => {
            // Obtém as consultas
            const consultas = res.consultas;

            // Limpa a tabela antes de carregar novos dados
            $('#table-consultas').empty();

            // Carrega as consultas na tabela
            consultas.map((consulta) => addConsulta(consulta));
        },
        error: (err) => {
            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
}


// Função para adicionar os dados a tabela
function addConsulta(consulta) {
    // tbody
    const $tbody = $('#table-consultas');

    // Cria a <tr></tr> 
    const $tr = $('<tr></tr>');

    // Cria as tds
    const posicao = $('<td></td>')
                        .text("1°")
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
                        .addClass('td-string')

    const entrada = $('<td></td>')
                        .text(consulta.data_entrada)
                        .addClass('td-time')

    const tempoDecorrido = $('<td></td>')
                        .text(formatarMinutos(consulta.tempo_decorrido))
                        .addClass('td-time')

    const etapa = $('<td></td>')
                        .text(consulta.situacao)
                        .addClass('td-time')

    // Ícone de ação
    const iconeMoreDetails = $('<i></i>').addClass('fa-solid fa-ellipsis icon-more-details');
    const iconAcao = $('<td></td>').append(iconeMoreDetails);
                        
    // Adiciona os elementos ao tr
    $tr
        .append(posicao)
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(prioridade)
        .append(entrada)
        .append(tempoDecorrido)
        .append(etapa)
        .append(iconAcao)

    // Adiciona ao tbody
    $tbody.append($tr);
}