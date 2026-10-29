const hospedeService = require("../service/hospedeService.js");

module.exports = class HospedeControl {
    #hospedeService;

    constructor(hospedeServiceDependency) {
        console.log("⬆️   HospedeControl.constructor()");
        this.#hospedeService = hospedeServiceDependency;
    }

    store = async (request, response, next) => {
        console.log("⬆️  HospedeControl.store()");
        try {
            const hospedejson = request.body.Hospede || request.body;
            
            // ✅ VERIFIQUE SE ESTÁ USANDO O SERVICE
            const novoHospede = await this.#hospedeService.createHospede(hospedejson);
            
            return response.status(201).send({
                success: true,
                message: "Cadastrado com sucesso",
                data: {
                    Hospedes: [{
                        idHospede: novoHospede.idHospede || novoHospede.insertId,
                        nome: hospedejson.nome,
                        telefone: hospedejson.telefone,
                        email: hospedejson.email,
                        requisicao: hospedejson.requisicao,
                        cpf: hospedejson.cpf
                    }]
                }
            });
        } catch (error) {
            next(error);
        }
    }

    index = async (request, response, next) => {
        console.log("⬆️  HospedeControl.index()");
        try {
            // ✅ VERIFIQUE SE ESTÁ USANDO O SERVICE
            const arrayHospedes = await this.#hospedeService.findAll();
            
            return response.status(200).send({
                success: true,
                message: "busca realizada com sucesso",
                data: {
                    Hospedes: arrayHospedes
                }
            })
        } catch (error) {
            next(error);
        }
    }

    show = async (request, response, next) => {
        console.log("⬆️  HospedeControl.show()");
        try {
            const hospedeId = request.params.idHospede;
            
            // ✅ VERIFIQUE SE ESTÁ USANDO O SERVICE
            const hospede = await this.#hospedeService.findbyId(hospedeId);
            
            return response.status(200).send({
                success: true,
                message: "busca realizada com sucesso",
                data: {
                    Hospedes: hospede
                }
            })
        } catch (error) {
            next(error);
        }
    }

    update = async (request, response, next) => {
        console.log("⬆️  HospedeControl.update()");
        try {
            const hospedeId = request.params.idHospede;
            const hospedeData = request.body.Hospede || request.body;
            
            const hospedeAtualizado = await this.#hospedeService.updateHospede(
                hospedeId, 
                hospedeData.nome, 
                hospedeData.telefone, 
                hospedeData.email, 
                hospedeData.requisicao, 
                hospedeData.cpf
            );
            
            return response.status(200).send({
                success: true,
                message: "Atualizado com sucesso",
                data: {
                    Hospedes: hospedeAtualizado  // ✅ Objeto direto
                }
            })
            
        } catch (error) {
            next(error);
        }
    }

    destroy = async (request, response, next) => {
        console.log("⬆️  HospedeControl.destroy()");
        try {
            const hospedeid = request.params.idHospede;
            await this.#hospedeService.deleteHospede(hospedeid);
            
            return response.status(200).send({
                success: true,
                message: "deletado com sucesso",
                data: null  // ✅ Nada a retornar após deletar
            })
            
        } catch (error) {
            next(error);
        }
    }
}