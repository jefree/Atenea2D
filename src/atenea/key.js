var KeyEventManager = function(){

    /*
      Almacenamos la referencia a este objeto.
    */
    var self = this;

    /*
      Mapa de las teclas del sistemas, que indica el estado de la tecla.
    */
    var keys = {};

    /*
      Cola de eventos ocurridos y que deben ser procesados.
    */
    var events = [];

    /*
      Actualiza el estado de la tecla que se presiono.
    */
    var keydown = function(evt){
        
        var key = evt.keyCode;
        events.push([key, 0]);   
    }

    /*
      Actualiza el estado de la teclas que se solto.
    */
    var keyup = function(evt){

        var key = evt.keyCode;
        events.push([key], 1);
    }

    /**
      Retorna el estado de la tecla solicitada.
    */
    self.key = function(key){

    }

    /*
      Registar los EventListener para monitorear el estado de las teclas.
    */
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
}