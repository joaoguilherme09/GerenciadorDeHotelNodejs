const HotelService = require("../service/hotelService.js");

//A camada de controle conhece o http
//Manda os dados para o service

module.exports = class HotelControl {
    #hotelService;

    /**
     * 
     * @param {HotelService} HotelServiceDependency 
     */
    constructor(HotelServiceDependency) {
        console.log("⬆️   HotelControl.constructor()");
        this.#hotelService = HotelServiceDependency;
    }

    store = async (request, response, next) => {    // POST
        console.log("⬆️  HotelControl.store()");
        try {
            const novoId = await this.#hotelService.createHotel(request.body);
            if (novoId) {
                return response.status(201).send({
                    success: true,
                    message: "Cadastrado com sucesso",
                    data: {
                        Hoteis: [{
                            idHotel: novoId,
                            nomeHotel: request.body.nome,
                            capacidade: request.body.capacidade,
                        }]
                    }
                });
            }

        } catch (error) {
            next(error);
        }
    }

    index = async (request, response, next) => {    //GET sem o id
        console.log("⬆️  HotelControl.index()");
        try {
            const arrayHoteis = await this.#hotelService.findAll();
            return response.status(200).send({
                success: true,
                message: "busca realizada com sucesso",
                data: {
                    Hoteis: arrayHoteis
                }
            })
        }
        catch (error) {
            next(error);
        }

    }

    show = async (request, response, next) => {  //Get com id
        console.log("⬆️  HotelControl.show()");
        try {
            const HotelId = request.params.idHotel; 
            const Hotel = await this.#hotelService.findbyId(HotelId);
            return response.status(200).send({
                success: true,
                message: "busca realizada com sucesso",
                data: {
                    Hoteis: Hotel
                }
            })
        } catch (error) {
            next(error);
        }
    }

    update = async (request, response, next) => {
        console.log("⬆️  HotelControl.update()");
        try {
            const HotelId = request.params.idHotel;
            const Hotelnome = request.body.nome;
            const Hotelcapacidade = request.body.capacidade;

            const atualizou = await this.#hotelService.updateHotel(HotelId, Hotelnome, Hotelcapacidade);
            if (atualizou) {
                return response.status(200).send({
                    success: true,
                    message: "Atualizado com sucesso",
                    data: {
                        Hoteis: [{
                            idHoteis: HotelId,
                            Hotelnome: Hotelnome,
                            Hotelcapacidade: Hotelcapacidade,
                        }]
                    }
                })
            } else {
                return response.status(404).send({
                    success: false,
                    message: "falha ao atualizar",
                    data: {
                        Hoteis: [{
                            idHoteis: HotelId,
                            Hotelnome: Hotelnome,
                            Hotelcapacidade: Hotelcapacidade,
                        }]
                    }
                })
            }
        } catch (error) {
            next(error);
        }
    }

    destroy = async (request, response, next) => {
        try {
            const Hotelid = request.params.idHotel;
            const excluiu = await this.#hotelService.deleteHotel(Hotelid);
            if (excluiu == true) {
                return response.status(204).send({
                    success: true,
                    message: "deletado com sucesso",
                    data: {
                        Hoteis: [{
                            idHoteis: Hotelid

                        }]
                    }
                })
            } else {
                return response.status(404).send({
                    success: false,
                    message: "falha ao deletar",
                    data: {
                        Hoteis: [{
                            idHoteis: Hotelid
                        }]
                    }
                })
            }
        } catch (error) {
            next(error);
        }
    }
}