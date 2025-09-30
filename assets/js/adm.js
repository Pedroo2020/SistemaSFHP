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
    const url = `${URL_API}/users`;

    $.ajax({
        url: url,
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
                        <td class="td-numero">${String(index + 1).padStart(2, "0")}</td>
                        <td class="td-string">${user.nome}</td>
                        <td class="td-numero">${idade}</td>
                        <td class="td-string">${sexos[user.sexo] ?? "-"}</td>
                        <td class="td-string">${cargos[user.tipo_usuario] ?? "-"}</td>
                        <td class="td-numero">${user.coren_crm_sus ?? "-"}</td>
                        <td class="td-time">
                            <i class="fa-solid fa-ellipsis icon-more-details" data-cpf="${user.cpf}"></i>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        },
        error: function (xhr) {
            console.error(xhr);
        }
    });
});


// Clique no ícone "..." para abrir modal editar usuário
$(document).on("click", ".icon-more-details", function () {
    const cpf = $(this).data("cpf");
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
            $("#sexo-editar").val(sexos[user.sexo]).trigger("change");
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

    const campoExtraCRM = $(".campo-extra-crm")
    const campoExtraCoren = $(".campo-extra-coren")

    tipoUsuario.on("change", function () {
        let tipo = $(this).val();

        if (tipo === "Paciente") {
            labelSus.text("Número do SUS");
            inputSus.attr("type", "text")
                .attr("placeholder", "Digite o número do SUS")
                .attr("id", "sus-cadastro")
                .attr("name", "sus-cadastro")
                .val("");
            campoExtraCRM.css("display", "none");
            campoExtraCoren.css("display", "none");
            inputSus.prop("required", true);
            inputExtra.prop("required", false);

        } else if (tipo === "Recepcionista" || tipo === "Administrador") {  
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtraCRM.css("display", "none");
            campoExtraCoren.css("display", "none");
            inputSus.prop("required", true);
            inputExtra.prop("required", false);

        } else if (tipo === "Enfermeiro") {
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtraCoren.css("display", "flex");
            campoExtraCRM.css("display", "none");


        } else if (tipo === "Medico") {
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");
            campoExtraCRM.css("display", "flex");
            campoExtraCoren.css("display", "none");
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
    const inputExtraEditar = $("#modalEditarUsuario #extra-editar");

    tipoUsuarioEditar.on("change", function () {
        let tipo = $(this).val();

        if (tipo === "Paciente") {
            labelSusEditar.text("Número do SUS");
            inputSusEditar.attr("type", "text")
                .attr("placeholder", "Digite o número do SUS")
                .attr("name", "sus-editar")
                .val("");
            campoExtraEditar.hide();
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", false);

        } else if (tipo === "Recepcionista" || tipo === "Administrador") {
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-editar")
                .val("");
            campoExtraEditar.hide();
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", false);

        } else if (tipo === "Enfermeiro") {
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-editar")
                .val("");
            campoExtraEditar.show();
            labelExtraEditar.text("COREN");
            inputExtraEditar.attr("placeholder", "Digite o COREN")
                .attr("name", "coren-editar")
                .val("");
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", true);

        } else if (tipo === "Medico") {
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-editar")
                .val("");
            campoExtraEditar.show();
            labelExtraEditar.text("CRM");
            inputExtraEditar.attr("placeholder", "Digite o CRM")
                .attr("name", "crm-editar")
                .val("");
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", true);
        }
    });

    tipoUsuarioEditar.trigger("change");
});

// Cadastrar Usuários
$(document).ready(function () {

    // Formtação do input de CPF
    formatCPF($('#cpf-cadastro'));

    // Formatação do input de Telefone
    formatTelefone($('#telefone-cadastro'));

    // Formatação do input do Número do Sus
    formatSUS($('#sus-cadastro'));

    $("#form-cadastro").on("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado para cadastrar um usuário.");
            return;
        }

        // Mapas
        const mapTipoUsuario = { "Paciente": 5, "Recepcionista": 4, "Enfermeiro": 3, "Medico": 2, "Administrador": 1 };
        const sexoMap = { "Masculino": 1, "Feminino": 2 };

        const tipoSelecionado = $("#tipo-user-cadastro").val();
        const tipo_usuario = mapTipoUsuario[tipoSelecionado];

        // Captura e formata valores
        const nome = $("#nome-cadastro").val();
        const cpf = $("#cpf-cadastro").val().replace(/\D/g, '');
        const email = $("#email-cadastro").val();
        const telefone = $("#telefone-cadastro").val().replace(/\D/g, '');
        const sexo = sexoMap[$("#sexo-cadastro").val()];
        const nascimento = $("#nascimento-cadastro").val();

        let coren_crm_sus = null;
        let senha = null;

        if (tipoSelecionado === "Paciente") {
            coren_crm_sus = $("#sus-cadastro").val().replace(/\D/g, '');
        }
        else if (tipoSelecionado === "Recepcionista" || tipoSelecionado === "Administrador") {
            senha = $("#senha-cadastro").val();
        }
        else if (tipoSelecionado === "Enfermeiro") {
            senha = $("#senha-cadastro").val();
            coren_crm_sus = $("#extra-cadastro").val(); // COREN
        }
        else if (tipoSelecionado === "Medico") {
            senha = $("#senha-cadastro").val();
            coren_crm_sus = $("#extra-cadastro").val(); // CRM
        }

        // Validações antes de enviar
        if (!cpf) {
            alert("CPF inválido!");
            return;
        }

        if (!sexo) {
            alert("Selecione um sexo válido!");
            return;
        }

        if (!tipo_usuario) {
            alert("Selecione um tipo de usuário válido!");
            return;
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

                alert(response.success);
                $("#form-cadastro")[0].reset();
                $("#modalNovoUsuario").hide();

                abledScroll();
                    
            },
            error: function (xhr) {
                const resp = xhr.responseJSON;
                alert(resp?.error || "Erro ao cadastrar usuário.");
            }
        });
    });
});

