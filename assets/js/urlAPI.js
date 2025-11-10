// URL da API
var URL_API = 'http://10.92.3.146:5000';

const socket = io(URL_API);

// Exporta como default
export { URL_API, socket };