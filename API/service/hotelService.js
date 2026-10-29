/*
    Responsável por chamar o DAO e pelas validações das regras de negócios
    As camadas http não devem saber que fazem parte de um sistema web, ou seja, não se ligar com a pasta http
*/
const Hotel = require("../Modelo/hotel.js");
const hotelDAO = require("../DAO/hotelDAO.js");
const ErrorResponse = require("../utils/errorresponse.js");

module.exports = class HotelService {
    #hotelDAO;

    constructor(hotelDAOdependency) {
        console.log("⬆️   Hotel Service.Constructor()");
        this.#hotelDAO = hotelDAOdependency;
    }

    // ✅ VALIDAÇÃO DE ID - MÉTODO AUXILIAR
    #validarId(id, entidade = "Hotel") {
        if (id === undefined || id === null || id === '') {
            throw new ErrorResponse(400, `ID do ${entidade} é obrigatório`);
        }

        const idNumerico = Number(id);
        if (isNaN(idNumerico) || !Number.isInteger(idNumerico)) {
            throw new ErrorResponse(400, `ID do ${entidade} deve ser um número inteiro`);
        }

        if (idNumerico <= 0) {
            throw new ErrorResponse(400, `ID do ${entidade} deve ser maior que 0`);
        }

        return idNumerico;
    }

    createHotel = async (hotelJson) => {
        console.log("  Hotel Service.createHotel()");

        // ✅ Validar dados obrigatórios
        if (!hotelJson.nome || !hotelJson.capacidade) {
            throw new ErrorResponse(400, "Nome e capacidade são obrigatórios");
        }

        const objHotelModel = new Hotel();
        objHotelModel.nome = hotelJson.nome;
        objHotelModel.capacidade = hotelJson.capacidade;

        // ✅ REGRA DE NEGÓCIO - Verificar se já existe hotel com o mesmo nome
        const hoteisComMesmoNome = await this.#hotelDAO.findbyfield('nome', hotelJson.nome);
        if (hoteisComMesmoNome && hoteisComMesmoNome.length > 0) {
            throw new ErrorResponse(
                400,
                "Já existe um hotel cadastrado com este nome."
            );
        }

        return this.#hotelDAO.create(objHotelModel);
    }

    findAll = async () => {
        console.log("  Hotel Service.findall()");
        return this.#hotelDAO.findall();
    }

    findbyId = async (idHotel) => {
        console.log("  Hotel Service.findbyId()");
        
        // ✅ VALIDAR ID ANTES DE USAR
        const id = this.#validarId(idHotel, "Hotel");
        
        const hotel = await this.#hotelDAO.findbyid(id);
        
        if (!hotel || hotel.length === 0) {
            throw new ErrorResponse(404, `Hotel com id ${id} não encontrado`);
        }
        
        return hotel;
    }

    updateHotel = async(id, nome, capacidade) => {
        console.log("  Hotel Service.updateHotel()");

        // ✅ VALIDAR ID ANTES DE USAR
        const idValidado = this.#validarId(id, "Hotel");

        // ✅ Validar dados obrigatórios
        if (!nome || !capacidade) {
            throw new ErrorResponse(400, "Nome e capacidade são obrigatórios");
        }

        // ✅ Verificar se o hotel existe
        const hotelExistente = await this.#hotelDAO.findbyid(idValidado);
        if (!hotelExistente || hotelExistente.length === 0) {
            throw new ErrorResponse(404, `Hotel com id ${idValidado} não encontrado`);
        }

        // ✅ Verificar se nome já está em uso por outro hotel
        const hoteisComMesmoNome = await this.#hotelDAO.findbyfield('nome', nome);
        if (hoteisComMesmoNome && hoteisComMesmoNome.length > 0) {
            const nomeEmUso = hoteisComMesmoNome.find(ch => ch.idHotel != idValidado);
            if (nomeEmUso) {
                throw new ErrorResponse(400, "Este nome já está sendo usado por outro hotel");
            }
        }

        const objHotelModel = new Hotel();
        objHotelModel.idHotel = idValidado;
        objHotelModel.nome = nome;
        objHotelModel.capacidade = capacidade;

        return this.#hotelDAO.update(objHotelModel);
    }

    deleteHotel = async(idHotel) => {
        console.log("  Hotel Service.deleteHotel()");
        
        // ✅ VALIDAR ID ANTES DE USAR
        const id = this.#validarId(idHotel, "Hotel");
        
        // ✅ Verificar se o hotel existe
        const hotelExistente = await this.#hotelDAO.findbyid(id);
        if (!hotelExistente || hotelExistente.length === 0) {
            throw new ErrorResponse(404, `Hotel com id ${id} não encontrado`);
        }

        const objHotelModel = new Hotel();
        objHotelModel.idHotel = id;

        return this.#hotelDAO.delete(objHotelModel);
    }
}