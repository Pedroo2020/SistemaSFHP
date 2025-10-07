// Importa a URL da API
import { URL_API } from './urlAPI.js';
// Funções para formatar
import { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone, formatarMinutos, formatarNumeroCPF } from './components/format.js';
// Função para calcular idade e remover caracteres nao numericos
import { calcularIdade, getNumber } from './components/utils.js';
// Função para mostrar mensagens de alerta
import alertMsg from './alertMsg.js';

// Função para desabilitar o scroll
function disabledScroll() {
    $(document.body).css('overflow', 'hidden');
}

// Função para habilitar o scroll
function abledScroll() {
    $(document.body).css('overflow', 'auto');
}

const botaoNovoUsuario = $('.btn-add-user');
const modalNovoUsuario = $('#modalNovoUsuario');
const modalEditarUsuario = $('#modalEditarUsuario')
const fecharModalAdicionarUsuario = $('#fechar-modal-adicionar-usuario');
const fecharModalEditarUsuario = $('#fechar-modal-editar-usuario')

// Abre o modal de novo usuário
botaoNovoUsuario.click(() => {
    modalNovoUsuario.css('display', 'flex');
    disabledScroll();
});

// Fecha o modal de novo usuario
fecharModalAdicionarUsuario.click(() => {
    modalNovoUsuario.hide();
    abledScroll();
    $('#modalNovoUsuario').find('input, textarea').val('');
});

// Função para carregar os usuários
function carregarUsuarios() {
    $.ajax({
        url: `${URL_API}/users`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: (res) => {

            // Obtém os usuários
            const usuarios = res.users;

            // Limpa a tabela antes de carregar novos dados
            $('#table-usuarios').empty();

            if (usuarios.length > 0) {
                // Carrega os usuários na tabela
                usuarios.map((user) => addUser(user));
            } else {

                // Adiciona uma mensagem de sem resultados encontrados
                const userNotFound = $('<tr></tr>')
                    .append($('<td></td>')
                        .text('Nenhum resultado encontrado para essa busca')
                        .addClass('consultas-not-found')
                        .attr('colspan', 9))

                // Adiciona a cédula a tabela
                $('#table-usuários').append(userNotFound);
            }

            // Obtém a data e hora atual
            const dataAtual = new Date()

            // Formata a data em padrão brasileiro
            const dataFormatada = dataAtual.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false // mantém no formato 24h
            });

            // Atualiza a data e hora da última atualização
            $('.last-att').text(`Última atualização: ${dataFormatada}`);
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

            // Exibe a mensagem
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
}

// Função para adicionar os dados a tabela
function addUser(user) {
    // Lista de cargos
    const cargos = {
        1: "Administrador",
        2: "Médico",
        3: "Enfermeiro",
        4: "Recepcionista",
        5: "Paciente"
    };

    // tbody
    const $tbody = $('#table-usuarios');

    // Cria a <tr></tr> 
    const $tr = $('<tr></tr>');

    const nome = $('<td></td>')
        .text(user.nome)
        .addClass('td-string')

    const idadeNumber = calcularIdade(user.data_nascimento);

    const idade = $('<td></td>')
        .text(idadeNumber)
        .addClass('td-numero')

    const sexo = $('<td></td>')
        .text(user.sexo === 1 ? 'Masculino' : 'Feminino')
        .addClass('td-string')

    const cargo = $('<td></td>')
        .text(cargos[user.tipo_usuario])
        .addClass('td-string')

    const susCorenCRM = $('<td></td>')
        .text(user.coren_crm_sus ? user.coren_crm_sus : '~')
        .addClass('td-numero')

    // Ícone de ação
    const iconeMoreDetails = $('<i></i>')
        .addClass('fa-solid fa-ellipsis icon-more-details')
        .attr('data-cpf', user.cpf);

    const iconAcao = $('<td></td>')
        .append(iconeMoreDetails)
        .addClass('td-time');

    // Adiciona os elementos ao tr
    $tr
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(cargo)
        .append(susCorenCRM)
        .append(iconAcao)

    // Adiciona ao tbody
    $tbody.append($tr);
}

// Puxar dados da API para montar a tabela
$(document).ready(function () {
    carregarUsuarios();

    InativarUser();
});


// Clique no ícone "..." para abrir modal editar usuário
$(document).on("click", ".icon-more-details", function () {
    const cpf = $(this).attr("data-cpf");
    const url = `${URL_API}/cadastro?cpf=${cpf}`;
    const token = localStorage.getItem("token");

    const cargos = {
        1: "Administrador",
        2: "Medico",
        3: "Enfermeiro",
        4: "Recepcionista",
        5: "Paciente"
    };

    const sexos = {
        1: "Masculino",
        2: "Feminino"
    };

    $.ajax({
        url: url,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {

            const user = response.user;

            // Preenche os inputs básicos
            $("#nome-editar").val(user.nome);
            $("#email-editar").val(user.email);

            // Preenche com as formatações
            $("#cpf-editar").val(formatarNumeroCPF(user.cpf));
            $("#telefone-editar").val(formatarNumeroTelefone(user.telefone));

            // Formata o input de cpf e telefone
            formatCPF($("#cpf-editar"), user.cpf)
            formatTelefone($('#telefone-editar'), user.telefone);

            // Salva o valor do CPF antigo no input hidden
            $('#old-cpf').val(cpf);

            // Formata a data corretamente
            if (user.data_nascimento) {
                const dataRecebida = new Date(user.data_nascimento);
                const ano = dataRecebida.getUTCFullYear();
                const mes = String(dataRecebida.getUTCMonth() + 1).padStart(2, '0');
                const dia = String(dataRecebida.getUTCDate()).padStart(2, '0');

                const dataFormatada = `${ano}-${mes}-${dia}`;

                $("#nascimento-editar").val(dataFormatada);
            } else {
                $("#nascimento-editar").val('');
            }

            // Seleciona sexo e tipo usuário
            $("#sexo-editar").val(sexos[user.sexo]).trigger("change");
            $("#tipo-user-editar").val(cargos[user.tipo_usuario]).trigger("change");

            // Campos extras
            $(".campo-extra-crm-editar").css("display", "none");
            $(".campo-extra-coren-editar").css("display", "none");
            $(".campo-extra-senha").css("display", "none");

            // Limpa valores antigos
            $("#senha-editar").val("");
            $("#crm-editar").val("");
            $("#coren-editar").val("");

            // Determina o tipo de usuário
            const tipo = (cargos[user.tipo_usuario] ?? "").toLowerCase();

            // Lógica de exibição dos campos extras
            if (tipo === "administrador" || tipo === "recepcionista") {
                // Mostra campo de senha
                $(".campo-extra-senha").css("display", "flex");
                $("#senha-editar").val(user.senha ?? "");
                $("#sus-editar").val(""); // sem SUS

            } else if (tipo === "medico") {
                $(".campo-extra-senha").show();
                $(".campo-extra-crm-editar").show();
                $("#senha-editar").val(user.senha ?? "");
                $("#crm-editar").val(user.coren_crm_sus ?? "");
                $("#sus-editar").val("");

            } else if (tipo === "enfermeiro") {
                $(".campo-extra-senha").show();
                $(".campo-extra-coren-editar").show();
                $("#senha-editar").val(user.senha ?? "");
                $("#coren-editar").val(user.coren_crm_sus ?? "");
                $("#sus-editar").val("");

            } else if (tipo === "paciente") {
                // Apenas número do SUS
                $("#sus-editar").val(user.coren_crm_sus ?? "");
            }

            // Abre o modal
            $("#modalEditarUsuario").css("display", "flex");
            $("body").css("overflow", "hidden");
        },
        error: function (err) {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Exibe a mensagem
            alertMsg("Erro ao carregar usuário.", "error", "#msg-home");
        }
    });
});

// Fecha o modal de editar usuario
fecharModalEditarUsuario.click(() => {
    modalEditarUsuario.hide();
    abledScroll();
});


function alteraSelect(itens) {
    const tipoUsuario = itens.tipoUsuario

    const campoSus = itens.campoSus
    const campoSenha = itens.campoSenha
    const campoCRM = itens.campoCRM
    const campoCOREN = itens.campoCOREN

    tipoUsuario.on("change", function () {
        const tipo = $(this).val();

        // Esconde todos os campos opcionais inicialmente
        campoSus.hide();
        campoSenha.hide();
        campoCRM.hide();
        campoCOREN.hide();

        if (tipo === "Paciente") {
            campoSus.show();
            $(".camp-lad-cpf").css('width', '100%')
        }
        else if (tipo === "Enfermeiro") {
            campoCOREN.show();
            campoSenha.show();
            $(".camp-lad-cpf").css('width', '100%')
        }
        else if (tipo === "Medico") {
            campoCRM.show();
            campoSenha.show();
            $(".camp-lad-cpf").css('width', '100%')
        } else {
            campoSenha.show();
            $(".camp-lad-cpf").css('width', '50%')
        }
    });
}


// Mudar inputs dependendo do tipo usuário do modal de adicionar usuário
$(document).ready(function () {
    const tipoUsuario = $("#tipo-user-cadastro");

    alteraSelect({
        tipoUsuario: $("#tipo-user-cadastro"),
        campoSus: $(".campo-sus-cadastro"),
        campoSenha: $(".campo-senha-cadastro"),
        campoCRM: $(".campo-extra-crm"),
        campoCOREN: $(".campo-extra-coren")
    })

    // Executa ao abrir o modal
    tipoUsuario.trigger("change");
});

// Mudar inputs dependendo do tipo usuário do modal de editar usuário
$(document).ready(function () {
    const tipoUsuarioEditar = $("#tipo-user-editar");

    alteraSelect({
        tipoUsuario: $("#tipo-user-editar"),
        campoSus: $(".campo-sus-editar"),
        campoSenha: $(".campo-senha-editar"),
        campoCRM: $(".campo-extra-crm-editar"),
        campoCOREN: $(".campo-extra-coren-editar")
    })

    tipoUsuarioEditar.trigger("change");
});

// Cadastrar Usuários
$(document).ready(function () {

    // Formtação do input de CPF
    formatCPF($('#cpf-cadastro'));
    formatCPF($('#cpf-editar'));

    // Formatação do input de Telefone
    formatTelefone($('#telefone-cadastro'));
    formatTelefone($('#telefone-editar'));

    // Formatação do input do Número do Sus
    formatSUS($('#sus-cadastro'));
    formatSUS($('#sus-editar'));

    $("#form-cadastro").on("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            // Redireciona para login
            localStorage.clear();
            return window.location.href = "index.html";
        }

        // Mapas
        const mapTipoUsuario = { "Paciente": 5, "Recepcionista": 4, "Enfermeiro": 3, "Medico": 2, "Administrador": 1 };
        const sexoMap = { "Masculino": 1, "Feminino": 2 };

        const tipoSelecionado = $("#tipo-user-cadastro").val();
        const tipo_usuario = mapTipoUsuario[tipoSelecionado];

        // Captura e formata valores
        const nome = $("#nome-cadastro").val();
        const cpf = getNumber($("#cpf-cadastro").val());
        const email = $("#email-cadastro").val();
        const telefone = getNumber($("#telefone-cadastro").val());
        const sexo = sexoMap[$("#sexo-cadastro").val()];
        const nascimento = $("#nascimento-cadastro").val();

        let coren_crm_sus = null;
        let senha = null;

        if (tipoSelecionado === "Paciente") {
            coren_crm_sus = getNumber($("#sus-cadastro").val());
        }
        else if (tipoSelecionado === "Recepcionista" || tipoSelecionado === "Administrador") {
            senha = $("#senha-cadastro").val();
        }
        else if (tipoSelecionado === "Enfermeiro") {
            senha = $("#senha-cadastro").val();
            coren_crm_sus = $("#coren-cadastro").val(); // COREN
        }
        else if (tipoSelecionado === "Medico") {
            senha = $("#senha-cadastro").val();
            coren_crm_sus = $("#crm-cadastro").val(); // CRM
        }

        // Monta JSON para API
        const data = { nome, email, cpf, telefone, sexo, nascimento, tipo_usuario, coren_crm_sus, senha };

        // Chamada AJAX
        $.ajax({
            url: `${URL_API}/cadastro`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            data: JSON.stringify(data),
            success: function (response) {

                alertMsg(response.success, "success", "#msg-home");
                $("#form-cadastro")[0].reset();
                $("#modalNovoUsuario").hide();

                abledScroll();

                // Recarrega os usuários
                carregarUsuarios();

            },
            error: function (err) {
                // Logout true     
                if (err.responseJSON.logout) {
                    // Limpa o local storage
                    localStorage.clear();
                    // Salva a mensagem 
                    localStorage.setItem('msg-logout', err.responseJSON.error);
                    // Redireciona para login
                    return window.location.href = 'index.html';
                }

                // Exibe a mensagem
                alertMsg(err.responseJSON.error, "error", "#msg-cadastro");
            }
        });
    });
});

// Editar usuários
$("#form-editar").on("submit", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    const mapTipoUsuario = { "Paciente": 5, "Recepcionista": 4, "Enfermeiro": 3, "Medico": 2, "Administrador": 1 };
    const sexoMap = { "Masculino": 1, "Feminino": 2 };

    const tipoSelecionado = $("#tipo-user-editar").val();
    const tipo_usuario = mapTipoUsuario[tipoSelecionado];

    const nome = $("#nome-editar").val();
    const cpfNovo = getNumber($("#cpf-editar").val());
    const cpfAntigo = getNumber($("#old-cpf").val());
    const email = $("#email-editar").val();
    const telefone = getNumber($("#telefone-editar").val());
    const sexo = sexoMap[$("#sexo-editar").val()];
    const nascimento = $("#nascimento-editar").val();

    let coren_crm_sus = null;
    let senha = null;

    if (tipoSelecionado === "Paciente") {
        coren_crm_sus = getNumber($("#sus-editar").val());
    } else if (tipoSelecionado === "Recepcionista" || tipoSelecionado === "Administrador") {
        senha = $("#senha-editar").val();
    } else if (tipoSelecionado === "Enfermeiro") {
        senha = $("#senha-editar").val();
        coren_crm_sus = $("#coren-editar").val();
    } else if (tipoSelecionado === "Medico") {
        senha = $("#senha-editar").val();
        coren_crm_sus = $("#crm-editar").val();
    }

    const data = { nome, email, cpfNovo, cpfAntigo, telefone, sexo, nascimento, tipo_usuario, coren_crm_sus, senha };

    $.ajax({
        url: `${URL_API}/cadastro`,
        type: "PUT", // PUT para editar
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        success: function (response) {
            alertMsg(response.success, "success", "#msg-home");
            $("#form-editar")[0].reset();
            $("#modalEditarUsuario").hide();
            $("body").css("overflow", "auto");

            // Recarrega a lista de usuários
            carregarUsuarios();
        },
        error: function (err) {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Exibe a mensagem
            alertMsg(err.responseJSON?.error || "Erro ao editar usuário.", "error", "#msg-editar");
        }
    });
});

// Inativação de Usuário
function InativarUser() {
    const botaoExcluir = $(".btn-inativar-user")

    botaoExcluir.click(() => {

        const cpf = $('#old-cpf').val();

        if (!cpf) {
            return alertMsg('Erro inesperado. Tente novamente mais tarde.', 'error', '#msg-editar');
        }

        $.ajax({
            url: `${URL_API}/cadastro`,
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "Application/json"
            },
            data: JSON.stringify({ cpf }),
            success: (res) => {
                // Reseta o form
                $("#form-editar")[0].reset();

                // Oculta o form
                $("#modalEditarUsuario").hide();

                // Habilita o scroll
                $("body").css("overflow", "auto");

                // Exibe a mensagem
                alertMsg(res.success, "success", "#msg-home");

                // Recarrega a lista de usuários
                carregarUsuarios();
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

                // Exibe a mensagem
                alertMsg(err.responseJSON.error, "error", "#msg-editar");
            }
        })

    })
}

