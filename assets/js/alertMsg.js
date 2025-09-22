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

export default alertMsg;