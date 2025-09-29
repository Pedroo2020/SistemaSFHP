import { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone } from './components/format.js';
import { URL_API, socket } from './urlAPI.js';
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
});

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

// Puxar dados da API para montar a tabela
$(document).ready(function () {
    const token = localStorage.getItem("token");

    $.ajax({
        url: "http://localhost:5000/users",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {
            const tbody = $(".div-table table tbody");
            tbody.empty();

            const cargos = {
                1: "Administrador",
                2: "Médico",
                3: "Enfermeiro",
                4: "Recepcionista",
                5: "Paciente"
            };
            const sexos = {
                 1: "Masculino",
                 2: "Feminino" 
                };

            $.each(response.users, function (index, user) {
                const idade = calcularIdade(user.data_nascimento);

                const row = `
                    <tr>
                        <td>${String(index + 1).padStart(2, "0")}</td>
                        <td>${user.nome}</td>
                        <td>${idade}</td>
                        <td>${sexos[user.sexo] ?? "-"}</td>
                        <td>${cargos[user.tipo_usuario] ?? "-"}</td>
                        <td>${user.coren_crm_sus ?? "-"}</td>
                        <td>
                            <i class="fa-solid fa-ellipsis icon-more-details" data-cpf="${user.cpf}"></i>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        },
        error: function (xhr) {
            console.error(xhr);
            alert("Erro ao buscar usuários.");
        }
    });
});


// Clique no ícone "..." para abrir modal editar usuário
$(document).on("click", ".icon-more-details", function () {
    const cpf = $(this).data("cpf");
    const token = localStorage.getItem("token");

    const cargos = {
        1: "Administrador",
        2: "Médico",
        3: "Enfermeiro",
        4: "Recepcionista",
        5: "Paciente"
    };

    const sexos = {
        1: "Masculino",
        2: "Feminino"
    };

    $.ajax({
        url: `http://localhost:5000/cadastro?cpf=${cpf}`,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {

            const user = response.user;

            // Preenche os inputs básicos
            $("#nome-editar").val(user.nome);
            $("#email-editar").val(user.email);
            $("#cpf-editar").val(user.cpf);
            $("#telefone-editar").val(user.telefone);
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
            $("#sexo-editar").val(sexos[user.sexo].toLowerCase()).trigger("change");
            $("#tipo-user-editar").val(cargos[user.tipo_usuario]).trigger("change");

            // Campos extras
            const tipo = (cargos[user.tipo_usuario] ?? "").toLowerCase();
            const inputSus = $("#sus-editar");
            const campoExtra = $("#campo-extra");
            const inputExtra = $("#extra-cadastro");
            const labelSus = $("label[for='sus-editar']");
            const labelExtra = $("#campo-extra label");

            if (tipo === "administrador" || tipo === "recepcionista") {
                labelSus.text("Senha");
                inputSus.attr("type", "password").val(user.senha ?? "");
                campoExtra.hide();
                inputExtra.val("");

            } else if (tipo === "medico") {
                labelSus.text("Senha");
                inputSus.attr("type", "password").val(user.senha ?? "");
                campoExtra.show();
                labelExtra.text("CRM");
                inputExtra.val(user.coren_crm_sus ?? "");

            } else if (tipo === "enfermeiro") {
                labelSus.text("Senha");
                inputSus.attr("type", "password").val(user.senha ?? "");
                campoExtra.show();
                labelExtra.text("COREN");
                inputExtra.val(user.coren_crm_sus ?? "");

            } else if (tipo === "paciente") {
                labelSus.text("Número do SUS");
                inputSus.attr("type", "text").val(user.coren_crm_sus ?? "");
                campoExtra.hide();
                inputExtra.val("");
            }

            // Abre o modal
            $("#modalEditarUsuario").css("display", "flex");
            $("body").css("overflow", "hidden");
        },
        error: function () {
            alert("Erro ao carregar usuário.");
        }
    });
});

// Fecha o modal de editar usuario
fecharModalEditarUsuario.click(() => {
    modalEditarUsuario.hide();
    abledScroll();
});

// Mudar inputs dependendo do tipo usuário do modal de adicionar usuário
$(document).ready(function () {
    const tipoUsuario = $("#tipo-user-cadastro");
    const labelSus = $("label[for='sus']");
    const inputSus = $("#sus-cadastro");
    const campoExtra = $("#campo-extra");
    const labelExtra = $("#campo-extra label");
    const inputExtra = $("#extra-cadastro");

    tipoUsuario.on("change", function () {
        let tipo = $(this).val();

        if (tipo === "paciente") {
            labelSus.text("Número do SUS");
            inputSus.attr("type", "text")
                .attr("placeholder", "Digite o número do SUS")
                .attr("id", "sus-cadastro")
                .attr("name", "sus-cadastro")
                .val("");
            campoExtra.hide();
            inputSus.prop("required", true);
            inputExtra.prop("required", false);

        } else if (tipo === "recepcionista" || tipo === "Administrador") {
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtra.hide();
            inputSus.prop("required", true);
            inputExtra.prop("required", false);

        } else if (tipo === "enfermeiro") {
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtra.show();
            labelExtra.text("COREN");
            inputExtra.attr("placeholder", "Digite o COREN")
                .attr("name", "coren-cadastro")
                .val("");
            inputSus.prop("required", true);
            inputExtra.prop("required", true);

        } else if (tipo === "medico") {
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtra.show();
            labelExtra.text("CRM");
            inputExtra.attr("placeholder", "Digite o CRM")
                .attr("name", "crm-cadastro")
                .val("");
            inputSus.prop("required", true);
            inputExtra.prop("required", true);
        }
    });

    tipoUsuario.trigger("change");
});

// Mudar inputs dependendo do tipo usuário do modal de editar usuário
$(document).ready(function () {
    const tipoUsuarioEditar = $("#modalEditarUsuario #tipo-user-editar");
    const labelSusEditar = $("#modalEditarUsuario label[for='sus']");
    const inputSusEditar = $("#modalEditarUsuario #sus-editar");
    const campoExtraEditar = $("#modalEditarUsuario #campo-extra");
    const labelExtraEditar = $("#modalEditarUsuario #campo-extra label");
    const inputExtraEditar = $("#modalEditarUsuario #extra-cadastro");

    tipoUsuarioEditar.on("change", function () {
        let tipo = $(this).val();

        if (tipo === "paciente") {
            labelSusEditar.text("Número do SUS");
            inputSusEditar.attr("type", "text")
                .attr("placeholder", "Digite o número do SUS")
                .attr("name", "sus-cadastro")
                .val("");
            campoExtraEditar.hide();
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", false);

        } else if (tipo === "recepcionista" || tipo === "Administrador") {
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtraEditar.hide();
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", false);

        } else if (tipo === "enfermeiro") {
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtraEditar.show();
            labelExtraEditar.text("COREN");
            inputExtraEditar.attr("placeholder", "Digite o COREN")
                .attr("name", "coren-cadastro")
                .val("");
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", true);

        } else if (tipo === "medico") {
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtraEditar.show();
            labelExtraEditar.text("CRM");
            inputExtraEditar.attr("placeholder", "Digite o CRM")
                .attr("name", "crm-cadastro")
                .val("");
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", true);
        }
    });

    tipoUsuarioEditar.trigger("change");
});
