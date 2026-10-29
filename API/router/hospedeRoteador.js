module.exports = class hospedeRoteador {
    #router;
    #hospedemiddleware;
    #hospedeControl;
    #jwtMiddleware;

    constructor(router, jwtMiddleware, hospedemiddleware, hospedeControl) {
        this.#router = router;
        this.#jwtMiddleware = jwtMiddleware;
        this.#hospedemiddleware = hospedemiddleware;
        this.#hospedeControl = hospedeControl;
    }

    createRoutes = () => {
        this.#router.post("/",  
            this.#jwtMiddleware.validateToken,
            this.#hospedemiddleware.validateBody,
            this.#hospedeControl.store
        );
        

        this.#router.get("/",  
            this.#jwtMiddleware.validateToken,
            this.#hospedemiddleware.validateQueryParams,
            this.#hospedeControl.index
        );

        this.#router.get("/:idHospede",  
            this.#jwtMiddleware.validateToken,
            this.#hospedemiddleware.validateIdParam,
            this.#hospedeControl.show
        );

        this.#router.put("/:idHospede",  
            this.#jwtMiddleware.validateToken,
            this.#hospedemiddleware.validateIdParam,
            this.#hospedemiddleware.validateBody,
            this.#hospedeControl.update
        );

        this.#router.delete("/:idHospede",  
            this.#jwtMiddleware.validateToken,
            this.#hospedemiddleware.validateIdParam,
            this.#hospedeControl.destroy
        );
        
        return this.#router;
    }
}