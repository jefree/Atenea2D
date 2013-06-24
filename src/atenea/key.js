var KeyEventManager = function(){

    /*
      Diccionario con teclas que no poseen un codigo ascii valido.
    */
    var SPECIAL_MAP = {
        space:32,
        ctrl:17, 
        shift:16,
        alt:18,
        tab:9,
        up:38,
        down:40,
        left:37,
        right:39
    };

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
        events.push([key, 1]);
    }

    /*
      actualiza el estado de las teclas en base a los eventos ocurridos.
    */
    self.update = function(){

        //console.log('KeyEventManager update');

        copy = events.slice();
        events = [];

        for (var i=0; i<copy.length; i++){

            key = copy[i][0]
            evt = copy[i][1];

            if (keys[key] === undefined){
                keys[key] = 'UP';
            }

            if (evt == 0){ // evento keydown

                switch(keys[key]){

                    case 'UP':
                        keys[key] = 'DOWN';
                        break;

                    case 'DOWN':
                        keys[key] = 'PRESSED';
                        break;

                }

            } else { //evento keyup

                switch(keys[key]){

                    case 'DOWN':
                    case 'PRESSED':
                        keys[key] = 'RELEASED';
                        events.push([key, 1])
                        break;

                    case 'RELEASED':
                        keys[key] = 'UP';
                        break;
                }
            }
        }
    }

    /*
      Retorna el keyCode de la tecla especificada en @key.
    */
    var keyCode = function(key){
        return SPECIAL_MAP[key] || key.toUpperCase().charCodeAt(0);    
    }

    /**
      Retorna el estado de la tecla solicitada.
    */
    self.key = function(key){

        typeof(key)=='string' && ( key=keyCode(key) );

        return keys[key];
    }

    /*
      Registar los EventListener para monitorear el estado de las teclas.
    */
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
}