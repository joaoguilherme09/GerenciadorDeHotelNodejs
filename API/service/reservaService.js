/*
    Responsável por chamar o DAO e pelas validações das regras de negócios
    As camadas http não devem saber que fazem parte de um sistema web, ou seja, não se ligar com a pasta http
*/
const Reserva = require("../Modelo/reserva.js");
const ErrorResponse = require("../utils/errorresponse.js");

module.exports = class ReservaService {
    #reservaDAO;
    #hospedeDAO;
    #hotelDAO;

    constructor(reservaDAOdependency, hospedeDAOdependency, hotelDAOdependency) {
        console.log("⬆️   Reserva Service.Constructor()");
        this.#reservaDAO = reservaDAOdependency;
        this.#hospedeDAO = hospedeDAOdependency;
        this.#hotelDAO = hotelDAOdependency;
    }

    // ✅ VALIDAÇÃO DE ID - MÉTODO AUXILIAR
    #validarId(id, entidade = "Reserva") {
        if (id === undefined || id === null || id === '') {
            throw new ErrorResponse(400, `ID ${entidade} é obrigatório`);
        }

        const idNumerico = Number(id);
        if (isNaN(idNumerico) || !Number.isInteger(idNumerico)) {
            throw new ErrorResponse(400, `ID ${entidade} deve ser um número inteiro`);
        }

        if (idNumerico <= 0) {
            throw new ErrorResponse(400, `ID ${entidade} deve ser maior que 0`);
        }

        return idNumerico;
    }

    // Função auxiliar para validar datas
    #validarDatas = (inicio, fim) => {
        // Converte as strings para Date
        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        const hoje = new Date();
        
        // Validação do formato da data
        if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
            throw new ErrorResponse(400, "Datas inválidas. Use o formato YYYY-MM-DD");
        }

        // Extrai ano e mês para validação
        const anoInicio = dataInicio.getFullYear();
        const anoFim = dataFim.getFullYear();
        const mesInicio = dataInicio.getMonth();
        const mesFim = dataFim.getMonth();

        // Verifica se a data de fim está em um ano anterior ou no mesmo ano mas mês anterior
        if (anoFim < anoInicio || (anoFim === anoInicio && mesFim < mesInicio)) {
            throw new ErrorResponse(400, 
                `Período inválido: início ${inicio} e fim ${fim}. ` +
                `A data de fim não pode ser anterior à data de início no calendário.`
            );
        }

        // Normaliza todas as datas para meia-noite do seu respectivo dia
        const inicioNormalizado = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
        const fimNormalizado = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate());
        const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

        // Compara apenas as datas, ignorando horários
        if (inicioNormalizado.getTime() >= fimNormalizado.getTime()) {
            throw new ErrorResponse(400, 
                `Período inválido: início ${inicio} e fim ${fim}. ` +
                `A data de início deve ser pelo menos um dia anterior à data de fim.`
            );
        }

        if (inicioNormalizado.getTime() < hojeNormalizado.getTime()) {
            throw new ErrorResponse(400, 
                `Data inválida: início ${inicio}. ` +
                `A data de início não pode ser no passado.`
            );
        }
    }

    // Função auxiliar para verificar conflitos de reserva
    #verificarConflitosReserva = async (idHotel, inicio, fim, idReservaExcluir = null) => {
        // Converte as strings para Date e normaliza para meia-noite
        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        const inicioNormalizado = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
        const fimNormalizado = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate());
        
        const todasReservas = await this.#reservaDAO.findall();
        
        // Filtra reservas do mesmo hotel que se sobrepõem ao período
        const reservasConflitantes = todasReservas.filter(reserva => {
            // Ignora a própria reserva no caso de update
            if (idReservaExcluir && reserva.idReserva === idReservaExcluir) {
                return false;
            }
            
            if (reserva.idHotel != idHotel) {
                return false;
            }

            // Normaliza as datas da reserva existente
            const reservaInicio = new Date(reserva.inicio);
            const reservaFim = new Date(reserva.fim);
            const reservaInicioNormalizado = new Date(reservaInicio.getFullYear(), reservaInicio.getMonth(), reservaInicio.getDate());
            const reservaFimNormalizado = new Date(reservaFim.getFullYear(), reservaFim.getMonth(), reservaFim.getDate());

            // Verifica sobreposição usando datas normalizadas
            return (inicioNormalizado < reservaFimNormalizado && fimNormalizado > reservaInicioNormalizado);
        });

        if (reservasConflitantes.length > 0) {
            throw new ErrorResponse(400, `Já existe uma reserva para este hotel no período solicitado`);
        }
    }

    createReserva = async (reservaJson) => {
        console.log("⬆️ ReservaService.createReserva()");

        // ✅ VALIDAR IDS ANTES DE USAR
        const idHospede = this.#validarId(reservaJson.idHospede, "Hospede");
        const idHotel = this.#validarId(reservaJson.idHotel, "Hotel");

        // Validação dos dados recebidos
        if (!reservaJson.inicio || !reservaJson.fim) {
            throw new ErrorResponse(400, "Data de início e fim são obrigatórias");
        }

        // Validação das datas
        this.#validarDatas(reservaJson.inicio, reservaJson.fim);

        // Validação de chave estrangeira - Hospede
        const hospede = await this.#hospedeDAO.findbyid(idHospede);
        if (!hospede || hospede.length === 0) {
            throw new ErrorResponse(404, `Hospede com id ${idHospede} não encontrado`);
        }

        // Validação de chave estrangeira - Hotel
        const hotel = await this.#hotelDAO.findbyid(idHotel);
        if (!hotel || hotel.length === 0) {
            throw new ErrorResponse(404, `Hotel com id ${idHotel} não encontrado`);
        }

        // Verifica conflitos de reserva para o mesmo hotel
        await this.#verificarConflitosReserva(
            idHotel,
            reservaJson.inicio,
            reservaJson.fim
        );

        const objReservaModel = new Reserva();  
        objReservaModel.idHospede = idHospede;    
        objReservaModel.idHotel = idHotel;
        objReservaModel.inicio = reservaJson.inicio;
        objReservaModel.fim = reservaJson.fim;

        const novoId = await this.#reservaDAO.create(objReservaModel);
        return novoId;
    }

    findAll = async () => {
        console.log("⬆️ ReservaService.findall()");
        const reservas = await this.#reservaDAO.findall();
        return reservas || [];
    }

    findbyId = async (idReserva) => {
        console.log("⬆️ ReservaService.findbyId()");
        
        // ✅ VALIDAR ID ANTES DE USAR
        const id = this.#validarId(idReserva, "Reserva");

        const reserva = await this.#reservaDAO.findbyid(id);
        if (!reserva) {
            throw new ErrorResponse(404, `Reserva com id ${id} não encontrada`);
        }
        return reserva;
    }

    updateReserva = async(idReserva, idHospede, idHotel, inicio, fim) => {
        console.log("⬆️ ReservaService.updateReserva()");

        // ✅ VALIDAR TODOS OS IDS ANTES DE USAR
        const idReservaValidado = this.#validarId(idReserva, "Reserva");
        const idHospedeValidado = this.#validarId(idHospede, "Hospede");
        const idHotelValidado = this.#validarId(idHotel, "Hotel");

        if (!inicio || !fim) {
            throw new ErrorResponse(400, "Data de início e fim são obrigatórias");
        }

        // Validação das datas
        this.#validarDatas(inicio, fim);

        // Verifica se a reserva existe
        const reservaExistente = await this.#reservaDAO.findbyid(idReservaValidado);
        if (!reservaExistente) {
            throw new ErrorResponse(404, `Reserva com id ${idReservaValidado} não encontrada`);
        }

        // Validação de chave estrangeira - Hospede
        const hospede = await this.#hospedeDAO.findbyid(idHospedeValidado);
        if (!hospede || hospede.length === 0) {
            throw new ErrorResponse(404, `Hospede com id ${idHospedeValidado} não encontrado`);
        }

        // Validação de chave estrangeira - Hotel
        const hotel = await this.#hotelDAO.findbyid(idHotelValidado);
        if (!hotel || hotel.length === 0) {
            throw new ErrorResponse(404, `Hotel com id ${idHotelValidado} não encontrado`);
        }

        // Verifica conflitos de reserva para o mesmo hotel (excluindo a própria reserva)
        await this.#verificarConflitosReserva(idHotelValidado, inicio, fim, idReservaValidado);

        const objReservaModel = new Reserva();
        objReservaModel.idReserva = idReservaValidado;
        objReservaModel.idHospede = idHospedeValidado;
        objReservaModel.idHotel = idHotelValidado;
        objReservaModel.inicio = inicio;
        objReservaModel.fim = fim;

        const atualizado = await this.#reservaDAO.update(objReservaModel);
        if (!atualizado) {
            throw new ErrorResponse(500, "Erro ao atualizar reserva");
        }
        return true;
    }

    deleteReserva = async(idReserva) => {
        console.log("⬆️ ReservaService.deleteReserva()");

        // ✅ VALIDAR ID ANTES DE USAR
        const id = this.#validarId(idReserva, "Reserva");

        // Verifica se a reserva existe antes de tentar deletar
        const reservaExistente = await this.#reservaDAO.findbyid(id);
        if (!reservaExistente) {
            throw new ErrorResponse(404, `Reserva com id ${id} não encontrada`);
        }

        const objReservaModel = new Reserva();
        objReservaModel.idReserva = id;

        const deletado = await this.#reservaDAO.delete(objReservaModel);
        if (!deletado) {
            throw new ErrorResponse(500, "Erro ao deletar reserva");
        }
        return true;
    }
}