// URL da API
var URL_API = 'http://192.168.1.111:5000';

const socket = io(URL_API);

// Exporta como default
export { URL_API, socket };