var KeyEventManager = function(){

    /*
      Diccionario con los posibles eventos de las teclas.
    */

    var EVENT_MAP = {

        u: 'UP', up:'UP',
        d: 'DOWN', down: 'DOWN',
        p: 'PRESSED', press: 'PRESSED',
        r: 'RELEASED', release: 'RELEASED'
    }

    /*
      Diccionario con teclas que no poseen un codigo ascii valido.
    */
    var SPECIAL_MAP = {
        tab: 9,
        shift: 16,
        control: 17, ctrl: 17, 
        alt: 18,
        escape: 27, esc: 27,
        space: 32,
        left: 37, arrow_left: 37,
        up: 38, arrow_up: 38,
        right: 39, arrow_right: 39,
        down: 40, arrow_down: 40
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

    self.parseString = function(string){

        var result = [];

        if (string.indexOf('+') != -1){
            result = Util.StringToArray(string, '+');

            for (var i=0; i<result.length; i++){
                result[i] = keyCode(result[i]);
            }
        }
        else if(string.indexOf('-') != -1){
            result = Util.StringToArray(string, '-')

            result[0] = keyCode(result[0]);
            result[1] = EVENT_MAP[result[1]]; 
        }

        return result;
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