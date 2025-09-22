$('.sair').click(() => {
    // Limpa o local storage
    localStorage.clear();

    // Redireciona para login
    window.location.href = 'index.html';
})