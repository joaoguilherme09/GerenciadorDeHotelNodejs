const hospede = require("../Modelo/hotel");
const database = require("../DATABASE/mysqldatabase");
module.exports = class HotelDAO {
    #database;

    /**
     * 
     * @param {mysqlmysqldatabase} databaseInstance 
     * */

    constructor(databaseInstance) {//Injenção de dependência
        console.log("⬆️ hotelDAO.constructor()");
        this.#database = databaseInstance;

    }

    create = async (objHospede) => {
        console.log("⬆️ hotelDAO.create()");
        const SQL = "INSERT INTO hotel (nome,capacidade) VALUES (?,?)";
        const params = [objHospede.nome, objHospede.capacidade];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        if (!resultado) {
            throw new Error("Falha ao inserir\n");
        } return resultado.insertId;
    }

    delete = async (objHotel) => {
        console.log("⬆️ hotelDAO.delete()");
        const SQL = "DELETE FROM hotel where idHotel = ?;";
        const params = [objHotel.idHotel];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        if (!resultado) {
            throw new Error("Falha ao deletar\n");
        } return resultado.affectedRows > 0;
    }

    update = async (objhotel) => {
        console.log("⬆️ hotelDAO.update()");
        
        const SQL = "UPDATE hotel SET nome = ?, capacidade = ? WHERE idHotel = ?;";
        const params = [objhotel.nome, objhotel.capacidade,objhotel.idHotel];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);//Executa no mysql
        return resultado.affectedRows > 0;
    }

    findall = async () => {
        console.log("⬆️ hotel.findall()");
        const SQL = "select * from hotel;";
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL);//Executa no mysql
        //console.log(resultado);
        return resultado;
    }

    findbyid = async (idHotel) => {
        console.log("⬆️ hotelDAO.findbyid()", idHotel);
        
        // ✅ CORREÇÃO: Garantir que é número e usar campo correto
        const id = Number(idHotel);
        const resultado = await this.findbyfield('idHotel', id); // ❗ Mudei de 'idhotel' para 'idHotel'
        
        console.log("📦 hotelDAO.findbyid - resultado:", resultado);
        
        return (resultado && resultado.length > 0) ? resultado[0] : null;
    }

    findbyfield = async (field, value) => {
        console.log("⬆️ hotelDAO.findbyfield()", field, value);
        
        // ✅ CORREÇÃO: Campos permitidos com case correto
        const allowedfields = ["idHotel", "nome", "capacidade"]; // ❗ Mudei para idHotel
        if (!allowedfields.includes(field)) {
            throw new Error(`Campo inválido para busca ${field}`);
        }
        
        const SQL = `SELECT * FROM hotel WHERE ${field} = ?;`;
        const params = [value];
        
        console.log("📝 SQL:", SQL, "Params:", params);
        
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        
        console.log("📦 Resultado findbyfield:", resultado);
        
        return resultado || [];
    }


} 