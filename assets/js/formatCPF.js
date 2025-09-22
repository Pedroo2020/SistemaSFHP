
function formatCPF(input) {
    // Variável de controle do valor anterior
    let lastValue = '';

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

export default formatCPF;