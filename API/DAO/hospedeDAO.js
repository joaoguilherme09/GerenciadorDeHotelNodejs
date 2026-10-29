const hospede = require("../Modelo/hospede");
const database = require("../DATABASE/mysqldatabase");
module.exports = class HospedeDAO {
    #database;

    /**
     * 
     * @param {mysqlmysqldatabase} databaseInstance 
     * */

    constructor(databaseInstance) {//Injenção de dependência
        console.log("⬆️ HospedeDAO.constructor()");
        this.#database = databaseInstance;

    }

    create = async (objHospede) => {
        console.log("⬆️ HospedeDAO.create()");
        const SQL = "INSERT INTO hospede (nome,telefone,email,requisicao,CPF) VALUES (?,?,?,?,?)";
        const params = [objHospede.nome, objHospede.telefone, objHospede.email, objHospede.requisicao, objHospede.cpf];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        if (!resultado) {
            throw new Error("Falha ao inserir\n");
        } return resultado.insertId;
    }

    delete = async (objHospede) => {
        console.log("⬆️ HospedeDAO.delete()");
        const SQL = "DELETE FROM hospede where idHospede = ?;";
        const params = [objHospede.idHospede];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        if (!resultado) {
            throw new Error("Falha ao deletar\n");
        } return resultado.affectedRows > 0;
    }

    update = async (objHospede) => {
        console.log("⬆️ HospedeDAO.update()");
        
        const SQL = "UPDATE hospede SET nome = ?, telefone = ?,  email = ?, requisicao = ?, cpf = ? WHERE idHospede = ?;";
        const params = [objHospede.nome, objHospede.telefone, objHospede.email, objHospede.requisicao, objHospede.cpf, objHospede.idHospede];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        return resultado.affectedRows > 0;
    }

    findall = async () => {
        console.log("⬆️ HospedeDAO.findall()");
        const SQL = "select * from hospede;";
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL);//Executa no mysql
        //console.log(resultado);
        return resultado;
    }

    findbyid = async (idHospede) => {
        console.log("⬆️ HospedeDAO.findbyid()", idHospede);
        const resultado = await this.findbyfield('idhospede', idHospede);
        return resultado || null;
    }

    findbyfield = async (field, value) => {
        console.log("⬆️ HospedeDAO.findbyfield()");
        const allowedfields = ["idhospede", "nome", "telefone", "email", "requisicao", "cpf"];
        if (!allowedfields.includes(field)) {
            throw new Error(`Campo inválido para busca ${field}`);
        }
        const SQL = `select * from hospede where ${field} = ?;`;
        const params = [value];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        return resultado || [];
    }


} 