const ErrorResponse = require("../utils/errorresponse");
const Hospede = require("../Modelo/hospede");

module.exports = class HospedeMiddleware {
    static SORT_FIELDS = ['nome', 'email', 'telefone', 'idHospede', 'cpf'];
    static SORT_ORDERS = ['asc', 'desc'];

    /**
     * Valida o corpo da requisição para CREATE e UPDATE
     */
    validateBody = (request, response, next) => {
        console.log("🔷 HospedeMiddleware.validateBody()");
        console.log("📦 Body recebido:", request.body);
        
        const body = request.body;
        const hospedeData = body.Hospede || body;
        
        const camposObrigatorios = ["nome", "email", "telefone"];

        for (const campo of camposObrigatorios) {
            if (hospedeData[campo] === undefined || hospedeData[campo] === null) {
                console.log(`❌ Campo obrigatório faltando: ${campo}`);
                throw new ErrorResponse(400, `O campo '${campo}' é obrigatório`);
            }
        }

        request.body = hospedeData;
        console.log("✅ Body validado com sucesso");
        next();
    }

    /**
     * Valida o parâmetro de ID na URL
     */
    validateIdParam = (request, response, next) => {
        console.log("🔷 HospedeMiddleware.validateIdParam()");
        const { idHospede } = request.params;

        if (!idHospede) {
            console.log("❌ ID do hospede não fornecido");
            throw new ErrorResponse(400, "O parâmetro 'idHospede' é obrigatório");
        }

        const id = Number(idHospede);
        if (isNaN(id) || id <= 0) {
            console.log(`❌ ID inválido: ${idHospede}`);
            throw new ErrorResponse(400, "O parâmetro 'idHospede' deve ser um número válido");
        }

        console.log(`✅ ID validado: ${id}`);
        next();
    }

    /**
     * Valida parâmetros de consulta (query params) - Versão mais flexível
     */
    //Valida parâmetros de busca
    validateQueryParams = (request, response, next) => {
        console.log("🔷 HospedeMiddleware.validateQueryParams()");
        console.log("🔍 Query params recebidos:", request.query);
        
        const { ordenar_por, ordem, busca, page, limit } = request.query;

        // Validação de parâmetros de ordenação (se fornecidos)
        if (ordenar_por && !HospedeMiddleware.SORT_FIELDS.includes(ordenar_por)) {
            console.log(`❌ Campo de ordenação inválido: ${ordenar_por}`);
            throw new ErrorResponse(
                400, 
                `Campo de ordenação inválido. Use: ${HospedeMiddleware.SORT_FIELDS.join(', ')}`
            );
        }

        if (ordem && !HospedeMiddleware.SORT_ORDERS.includes(ordem.toLowerCase())) {
            console.log(`❌ Ordem inválida: ${ordem}`);
            throw new ErrorResponse(
                400, 
                `Direção de ordenação inválida. Use: ${HospedeMiddleware.SORT_ORDERS.join(', ')}`
            );
        }

        // Validação básica do termo de busca (se fornecido)
        if (busca && busca.trim().length < 2) {
            console.log(`❌ Termo de busca muito curto: ${busca}`);
            throw new ErrorResponse(400, "O termo de busca deve ter pelo menos 2 caracteres");
        }

        // Validação de paginação (se fornecida)
        if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
            console.log(`❌ Página inválida: ${page}`);
            throw new ErrorResponse(400, "O parâmetro 'page' deve ser um número maior que 0");
        }

        if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1)) {
            console.log(`❌ Limit inválido: ${limit}`);
            throw new ErrorResponse(400, "O parâmetro 'limit' deve ser um número maior que 0");
        }

        console.log("✅ Query params validados com sucesso");
        next();
    }

    /**
     * NOVO: Middleware específico para operações de listagem (GET)
     * Mais flexível e sem validação de body
     */
    validateForList = (request, response, next) => {
        console.log("🔷 HospedeMiddleware.validateForList()");
        console.log("🔍 Método:", request.method);
        console.log("🔍 URL:", request.url);
        console.log("🔍 Query params:", request.query);
        
        // ✅ CORREÇÃO: Chame validateQueryParams corretamente
        this.validateQueryParams(request, response, next);
    }
}