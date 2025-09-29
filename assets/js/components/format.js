function formatCPF(input, oldValue) {
    // Variável de controle do valor anterior
    let lastValue = oldValue || '';

    // Ao alterar o input de CPF
    $(input).on('input', function (e) {
        // Pega só os números do input
        let value = $(this).val().replace(/\D/g, '');

        // Não permite que passe de 14 caracteres
        if (value.length > 11) {
            value = lastValue;
        }

        // Detecta se foi apagado
        let inputType = e.originalEvent.inputType;

        // Caso o evento seja de apagar
        if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
            value = lastValue.slice(0, -1);
        }

        // Atualiza o valor anterior
        lastValue = value;

        // Máscara base
        let formatted = '___.___.___-__';

        // Preenche a máscara com os números
        for (let i = 0; i < value.length && i < 11; i++) {
            formatted = formatted.replace('_', value[i]);
        }

        $(this).val(formatted);
    });

    // Ao sair do input de CPF
    $(input).on('blur', function (e) {
        // Pega só os números do input
        let value = $(this).val().replace(/\D/g, '');

        // Caso esteja vazio, tira os underlines
        if (!value.length) {
            $(this).val('');
        }
    });
}

function formatSUS(input, oldValue) {
    let lastValue = oldValue || '';

    $(input).on('input', function (e) {
        let value = $(this).val().replace(/\D/g, '');

        // Limite de 15 dígitos
        if (value.length > 15) {
            value = lastValue;
        }

        let inputType = e.originalEvent.inputType;
        if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
            value = lastValue.slice(0, -1);
        }

        lastValue = value;

        // Máscara base
        let formatted = '___ ____ ____ ____';

        for (let i = 0; i < value.length && i < 15; i++) {
            formatted = formatted.replace('_', value[i]);
        }

        $(this).val(formatted);
    });

    $(input).on('blur', function () {
        let value = $(this).val().replace(/\D/g, '');
        if (!value.length) {
            $(this).val('');
        }
    });
}

function formatTelefone(input, oldValue) {
    let lastValue = oldValue || '';

    $(input).on('input', function (e) {
        let value = $(this).val().replace(/\D/g, '');

        // Limite de 11 dígitos
        if (value.length > 11) {
            value = lastValue;
        }

        let inputType = e.originalEvent.inputType;
        if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
            value = lastValue.slice(0, -1);
        }

        lastValue = value;

        // Máscara base
        let formatted = '(__) _____-____';

        for (let i = 0; i < value.length && i < 11; i++) {
            formatted = formatted.replace('_', value[i]);
        }

        $(this).val(formatted);
    });

    $(input).on('blur', function () {
        let value = $(this).val().replace(/\D/g, '');
        if (!value.length) {
            $(this).val('');
        }
    });
}

// Formata número do SUS (15 dígitos -> "0000 0000 0000 000")
function formatarNumeroSUS(value) {
    if (!value) return "";

    // Mantém apenas números
    value = value.replace(/\D/g, "").slice(0, 15);

    // Aplica formatação
    return value
        .replace(/^(\d{4})(\d)/, "$1 $2")
        .replace(/^(\d{4}) (\d{4})(\d)/, "$1 $2 $3")
        .replace(/^(\d{4}) (\d{4}) (\d{4})(\d)/, "$1 $2 $3 $4");
}

// Formata telefone brasileiro (10 ou 11 dígitos -> "(00) 00000-0000")
function formatarNumeroTelefone(value) {
    if (!value) return "";

    // Mantém apenas números
    value = value.replace(/\D/g, "").slice(0, 11);

    // Aplica formatação
    return value
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}

// Função para formatar minutos em horas e minutos
function formatarMinutos(minutos) {
    // Obtém hora e minuto separado
    let horas = String(Math.floor(minutos / 60));
    let min = String(minutos % 60);

    // Adiciona um 0 caso seja menor que 10 minutos
    if (min.length < 2) {
        min = `0${min}`;
    }

    // Adiciona um 0 caso seja menor que 10 horas
    if (horas.length < 2) {
        horas = `0${horas}`;
    }

    // Retorna formatado
    return `${horas}h ${min}min`
}

export { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone, formatarMinutos };