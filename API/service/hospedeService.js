/*
    Responsável por chamar o DAO e pelas validações das regras de negócios
    As camadas http não devem saber que fazem parte de um sistema web, ou seja, não se ligar com a pasta http
*/
const Hospede = require("../Modelo/hospede.js");
const hospedeDAO = require("../DAO/hospedeDAO.js");
const ErrorResponse = require("../utils/errorresponse.js");

module.exports = class HospedeService {
    #hospedeDAO;

    constructor(hospedeDAOdependency) {
        console.log("⬆️   Hospede Service.Constructor()");
        this.#hospedeDAO = hospedeDAOdependency;
    }

    // ✅ MÉTODO AUXILIAR PARA VALIDAR ID
    #validarId = (id, entidade = "Registro") => {
        if (!id) {
            throw new ErrorResponse(400, `ID da ${entidade} é obrigatório`);
        }
        
        const idNumero = Number(id);
        if (isNaN(idNumero) || idNumero <= 0) {
            throw new ErrorResponse(400, `ID da ${entidade} deve ser um número válido`);
        }
        
        return idNumero;
    }

    createHospede = async (hospedeJson) => {
        console.log("  Hospede Service.createHospede()");

        // ✅ Validar dados obrigatórios
        if (!hospedeJson.nome || !hospedeJson.email || !hospedeJson.telefone) {
            throw new ErrorResponse(400, "Nome, email e telefone são obrigatórios");
        }

        const objHospedeModel = new Hospede();
        objHospedeModel.nome = hospedeJson.nome;
        objHospedeModel.telefone = hospedeJson.telefone;
        objHospedeModel.email = hospedeJson.email;
        objHospedeModel.requisicao = hospedeJson.requisicao;
        objHospedeModel.cpf = hospedeJson.cpf;

        // ✅ REGRA DE NEGÓCIO - Verificar se já existe hospede com o mesmo email
        const hospedesComMesmoEmail = await this.#hospedeDAO.findbyfield('email', hospedeJson.email);
        if (hospedesComMesmoEmail && hospedesComMesmoEmail.length > 0) {
            throw new ErrorResponse(
                400,
                "Já existe um hospede cadastrado com este email."
            );
        }

        // ✅ REGRA DE NEGÓCIO - Verificar se já existe hospede com o mesmo CPF (se fornecido)
        if (hospedeJson.cpf) {
            const hospedesComMesmoCPF = await this.#hospedeDAO.findbyfield('cpf', hospedeJson.cpf);
            if (hospedesComMesmoCPF && hospedesComMesmoCPF.length > 0) {
                throw new ErrorResponse(
                    400,
                    "Já existe um hospede cadastrado com este CPF."
                );
            }
        }

        return this.#hospedeDAO.create(objHospedeModel);
    }

    findAll = async () => {
        console.log("  Hospede Service.findall()");
        return this.#hospedeDAO.findall();
    }

    findbyId = async (idHospede) => {
        console.log("  Hospede Service.findbyId()");
        
        const id = this.#validarId(idHospede, "Hospede");
        
        const hospede = await this.#hospedeDAO.findbyid(id);
        
        if (!hospede || hospede.length === 0) {
            throw new ErrorResponse(404, `Hospede com id ${id} não encontrado`);
        }
        
        // ✅ RETORNE O PRIMEIRO ELEMENTO (objeto), não o array
        return hospede[0];
    }

    updateHospede = async (id, nome, telefone, email, requisicao, cpf) => {
        console.log("  Hospede Service.updateHospede()");

        // ✅ VALIDAR ID ANTES DE USAR
        const idValidado = this.#validarId(id, "Hospede");

        // ✅ Validar dados obrigatórios
        if (!nome || !email || !telefone) {
            throw new ErrorResponse(400, "Nome, email e telefone são obrigatórios");
        }

        // ✅ Verificar se o hospede existe
        const hospedeExistente = await this.#hospedeDAO.findbyid(idValidado);
        if (!hospedeExistente || hospedeExistente.length === 0) {
            throw new ErrorResponse(404, `Hospede com id ${idValidado} não encontrado`);
        }

        // ✅ Verificar se email já está em uso por outro hospede
        const hospedesComMesmoEmail = await this.#hospedeDAO.findbyfield('email', email);
        if (hospedesComMesmoEmail && hospedesComMesmoEmail.length > 0) {
            const emailEmUso = hospedesComMesmoEmail.find(inq => inq.idHospede != idValidado);
            if (emailEmUso) {
                throw new ErrorResponse(400, "Este email já está sendo usado por outro hospede");
            }
        }

        // ✅ Verificar CPF duplicado (se fornecido)
        if (cpf) {
            const hospedesComMesmoCPF = await this.#hospedeDAO.findbyfield('cpf', cpf); // ✅ CORREÇÃO: 'cpf' minúsculo
            if (hospedesComMesmoCPF && hospedesComMesmoCPF.length > 0) {
                const cpfEmUso = hospedesComMesmoCPF.find(inq => inq.idHospede != idValidado);
                if (cpfEmUso) {
                    throw new ErrorResponse(400, "Este CPF já está sendo usado por outro hospede");
                }
            }
        }

        const objHospedeModel = new Hospede();
        objHospedeModel.idHospede = idValidado;
        objHospedeModel.nome = nome;
        objHospedeModel.telefone = telefone;
        objHospedeModel.email = email;
        objHospedeModel.requisicao = requisicao;
        objHospedeModel.cpf = cpf;

        return this.#hospedeDAO.update(objHospedeModel);
    }

    deleteHospede = async (idHospede) => {
        console.log("  Hospede Service.deleteHospede()");
        
        // ✅ VALIDAR ID ANTES DE USAR
        const id = this.#validarId(idHospede, "Hospede");
        
        // ✅ Verificar se o hospede existe
        const hospedeExistente = await this.#hospedeDAO.findbyid(id);
        if (!hospedeExistente || hospedeExistente.length === 0) {
            throw new ErrorResponse(404, `Hospede com id ${id} não encontrado`);
        }

        const objHospedeModel = new Hospede();
        objHospedeModel.idHospede = id;

        return this.#hospedeDAO.delete(objHospedeModel);
    }
}