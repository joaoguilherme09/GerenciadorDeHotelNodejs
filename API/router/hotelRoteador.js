module.exports = class hotelRoteador {
    #router;
    #hotelmiddleware;
    #hotelControl;
    #jwtMiddleware;

    constructor(router, jwtMiddleware, hotelmiddleware, hotelControl) {
        this.#router = router;
        this.#jwtMiddleware = jwtMiddleware;
        this.#hotelmiddleware = hotelmiddleware;
        this.#hotelControl = hotelControl;
    }

    createRoutes = () => {
        // ✅ ADICIONAR JWT MIDDLEWARE NAS ROTAS
        this.#router.post("/",  
            this.#jwtMiddleware.validateToken, // ✅ JWT
            this.#hotelmiddleware.validateBody,
            this.#hotelControl.store
        );
        
        this.#router.get("/",  
            this.#jwtMiddleware.validateToken, // ✅ JWT
            this.#hotelmiddleware.validateQueryParams,
            this.#hotelControl.index
        );

        this.#router.get("/:idHotel",  
            this.#jwtMiddleware.validateToken, // ✅ JWT
            this.#hotelmiddleware.validateIdParam,
            this.#hotelControl.show
        );

        this.#router.put("/:idHotel",  
            this.#jwtMiddleware.validateToken, // ✅ JWT
            this.#hotelmiddleware.validateIdParam,
            this.#hotelmiddleware.validateBody,
            this.#hotelControl.update
        );

        this.#router.delete("/:idHotel",  
            this.#jwtMiddleware.validateToken, // ✅ JWT
            this.#hotelmiddleware.validateIdParam,
            this.#hotelControl.destroy
        );
        
        return this.#router;
    }
}