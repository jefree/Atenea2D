
var Atenea = function(){

    /*
      Constantes relacionadas a expresiones regulares.
    */

    REXP_MODEL_ENTITY = /^[A-Z][a-z]+([A-Z][a-z]+)*/;
    REXP_MODEL_SCENE = /^[a-z]+$/;
    REXP_MODEL_LOGIC = /^[A-Z]+$/;
    REXP_WORDS_SPACE = /\s+/g;

    /*
      Almacena la referencia this para este objeto, para asi asegurar
      que siempre se referencia al objeto en si mismo y no ha otra
      entidad.
    */
    var self = this; 

    /*
      La escena que esta actualmente activa y que se dibujara y
      actualizara dentro del loop de la aplicacion.
    */
    var activeScene = undefined; 

    /*
      Diccionario con todas las escenas que allan sido registradas
      con el llamado a #scene.    
    */
    var scenes = {};
    
    /*
      Diccionario con todos los modelos registrados con el llamado
      #register.
    */
    var models = {};

    /*
      Es el encargado de manejar todo lo relacionado a los eventos
      del teclado.
    */
    var keys = new KeyEventManager();
    /*
      Diccionario con todos los logics regitrados con el llamado  a 
      #register
    */
    var logics = {};

    /**
      Inicializa las variables necesarias para el correcto
      funcionamiento de framework

      - w: ancho del canvas que se creara
      - h: alto del canvas que se creara
      - domParent: objeto dentro del cuerpo html al que se le
        asignara el canvas creado como hijo.
    */
    self.init = function(w, h, domParent){

        canvas.init(w, h, domParent);

        // select best function for animFrame

        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame    ||
                    function( callback ){
                        window.setTimeout(callback, 1000 / 60);
                    };
        })();
    }

    /**
      Registar un modelo para que este pueda ser usado posteriormente en
      la creacion de objetos concretos. @id determina si el modelo hace 
      referencia a una Entidad o a Una Escena, las entidades deben tener un
      id que Inicie con una letra mayuscula, mientras las escenas debe ir 
      completamente en minuscula.

      - id: string con el id del modelo
      - model: object que representa el modelo
    */
    self.register = function(id, model){

        var newModel = {}
        extend(newModel, model);

        if(id.match(REXP_MODEL_ENTITY)){

            newModel.logic && parseLogic(newModel.logic);
            models[id] = newModel;
        }
        else if(id.match(REXP_MODEL_SCENE)){

            scenes[id] = newModel;
        }
        else if(id.match(REXP_MODEL_LOGIC)){s

            parseLogic(newModel);
            logics[id] = newModel;
        }
    }

    /**
      Crea un objeto concreto que tendra las caracteristicas de los
      modelos mencionados en @type.

      - type: string que indica que modelos se usaran para crear el
        objeto concreto.
      - objects: si se especifica, dicho objecto se extendera con las
        caracteristicas de los modelos enunciados en @type
    */
    self.parse = function(type, object){

        var e = {};

        object && (e=object);

        var models = Util.StringToArray(type);

        for (n in models){

            if (models[n].match(REXP_MODEL_ENTITY)){
                add(e, models[n]);
            }
            else if(models[n].match(REXP_MODEL_LOGIC)){
                self.logic(e, logics[models[n]], false);
            }
        }

        return e;
    }

    /**
      Cambia la escena actual por la indicada en @id.

      - id: id de la escena a ser establecidad como activa.
      - scene: si se especifica, se registrara el modelo como una
        escena, con el id igual a @id.
    */
    self.scene = function(id, scene){
        activeScene = scenes[id];
    }

    /**
      Lanza el loop principal de la aplicacion, usando la escena con el id
      igual a @id.

      - id: id de la escena a usar como principal.
    */

    self.start = function(id){

        activeScene = scenes[id];
        
        animLoop();
    }

    /*
      Extiende el LogicBlock de una entidad, con el modelo de LogicBlock
      en @model.

      - e: entidad
      - model: modelo del LogicBlock con el que se extendera el LogicBlock
        actual de @e.
      - parse: indica si se debe o no parsear @modelo.
    */
    self.logic = function(e, model, parse){

        (parse === undefined) && (parse=true);

        var attributes = ['sensor', 'controller', 'actuator']

        //crear el logic si no existe
        e.logic || (e.logic = {});

        //convertir strings de controller en arreglos
        parse && parseLogic(model);

        //extender sensor y actuator en el logic
        for(var i=0; i<attributes.length; i++){

            var attr = attributes[i];

            model[attr] && (e.logic[attr] || (e.logic[attr]={}));

            extend(e.logic[attr], model[attr]);
        }
    }

    /*
      Convierte, si lo son, strings de controller en @logic en arreglos.

      - logic: modelo a ser parseado.
    */
    var parseLogic = function(logic){

        var controllers = logic.controller;
        var attributes = ['sensor', 'actuator'];

        for (var n in controllers){

            var ctrl = controllers[n];

            ctrl.operator = ctrl.operator.toUpperCase();

            for (var i=0; i<attributes.length; i++){
                var attr = attributes[i];

                (typeof(ctrl[attr]) == 'string') &&
                    (ctrl[attr] = Util.StringToArray(ctrl[attr]));
            }
        }

        // parse each sensor
        if ( logic.hasOwnProperty('sensor') ){
            for (var name in logic.sensor){
                logic.sensor[name] = keys.parseString(logic.sensor[name]);
            }
        }
    }

    /*
      Extiende las caracteristicas del objeto @dst con las del objeto
      @src.

      - dst - objeto a ser extendido.
      - src - objeto con las nuevas caracteristicas.
    */
    var extend = function(dst, src){

        for (f in src){

            if( ! dst.hasOwnProperty(f) ){

                if ( src[f].constructor.name == 'Object' ){
                    dst[f] = {};
                    extend(dst[f], src[f]);
                }
                else {
                    dst[f] = src[f];
                }
            }
        }
    }

    /*
      Extiende una entidad @e con las caractetisticas del model @model, y lo
      inicializa de ser necesario.

      - e: entidad ha ser extendida
      - model: modelo base para extender a la entidad @e.
    */
    var add = function(e, model){

        if(model in models){

            var model_data = models[model];

            extend(e, model_data);

            model_data.logic && self.logic(e, model_data.logic, false);
            
            model_data.init && model_data.init.call(e);
            
        }
    }

    /*
      Dibuja todos las entidades dentro de la escena activa.
    */
    var draw = function(){

        var entities = activeScene.entities;

        canvas.context.fillStyle = 'white';
        canvas.context.fillRect(0, 0, canvas.size().width, canvas.size().height)

        for (var i=0; i<entities.length; i++){
            entities[i].draw.apply(entities[i], [canvas.context]);
        }
    }

    /*
    */
    var processLogic = function(){

        for(var i=0; i<activeScene.entities.length; i++){

            var e = activeScene.entities[i];

            var all_sensors = getSensorState(e.logic.sensor);

            for (var name in e.logic.controller){

                var c = e.logic.controller[name];
                var sensors = []
                var operator = c.operator;
                var output = false;

                // filtrar los sensores de este controlador
                for (var n in c.sensor){
                    sensors.push(all_sensors[c.sensor[n]]);
                }

                // determinar la salida del controlador segun el operador
                if ( operator == 'AND'){
                    output = sensors.indexOf(false) == -1;
                }
                else if(operator == 'OR'){
                    output = sensors.indexOf(true) != -1;
                }
                else if(operator == 'NAND'){
                    output = sensors.indexOf(true) == -1;
                }
                else if(operator == 'NOR'){
                    output = sensors.indexOf(false) != -1;
                }
                else if (operator == 'XOR'){
                    output = sensors.filter( function(v){return v;} ).length == 1;
                }
                else if(operator == 'XNOR'){
                    output = sensors.filter( function(v){return !v;} ).length == 1;
                }

                if (output){

                    for (var n in c.actuator){
                        e.logic.actuator[c.actuator[n]].call(e);
                    }
                }
            }
        }
    }

    /*
      Analiza el estado de cada uno de los sensores en la entidad @e
      y retorna un diccionario con dichos estados.

      - e: entidad que contiene los sensores ha ser analizados.
    */
    var getSensorState = function(sensors){

        var sensor_status = {};

        key_sensor = getKeySensorState(sensors);

        extend(sensor_status, key_sensor);

        return sensor_status;
    }

    /*
      Analiza los sensores en @sensors, asumiendo que son sensores de teclado.

      - sensors: sensores de teclado ha ser analizados.
    */
    var getKeySensorState = function(sensors){

        key_sensor_status = {};

        for (var name in sensors){

            var sensor = sensors[name];

            if (sensor.length == 1){

                key_sensor_status[name] = 
                    ['DOWN', 'PRESSED'].indexOf(keys.key(sensor[0])) != -1;
            
            } else {

                key_sensor_status[name] = true;
                var state = ['DOWN', 'PRESSED'];
                var limit = sensor.length;

                if (typeof sensor[sensor.length-1] == 'string'){
                    state = [sensor[sensor.length-1]];
                    limit -= 1;
                }

                for (var s=0; s<limit; s++){
                    key_status = keys.key(sensor[s])

                    if(state.indexOf(key_status) == -1){
                        key_sensor_status[name] = false;
                        break;
                    } 
                }
            }
        }

        return key_sensor_status;
    }

    /*
      Actualiza el estado de las entidades en la escena actual.
    */
    var update = function(){
        
        keys.update();
        processLogic();
    }

    /*
      Bucle principal de la aplicacion.
    */
    var animLoop = function(){

        requestAnimFrame(animLoop);
        update();
        draw();
    }

    /*
      Objetos canvas interno, que maneja todo relacionado a el tag canvas
      dentro de cuerpo del html.
    */
    var canvas = new (function(){

        /*
          Guarda la referencia este objeto.
        */
        var self = this;

        /**
          Inicializa el canvas y crea el elemento dentro del DOM del 
          documento HTML y lo asigna como hijo a el elemento referenciado por 
          @domParent.

          - w: ancho del canvas.
          - h: alto del canvas.
          - domParent: elemento dentro del DOM al que se agregara el canvas
            creado.
        */
        self.init = function(w, h, domParent){

            self.domElement = document.createElement('canvas');
            self.context = self.domElement.getContext('2d');

            self.domElement.width = w;
            self.domElement.height = h;

            if(domParent !== undefined){
                domParent.appendChild(self.domElement);
            }else{
                document.body.appendChild(self.domElement);
            }
        }

        /*
          Asigna o retorna el tamaño del canvas segun el numero parametros
          que recibe.

          - 0 args: retorna el tamaño actual del canvas.
          - 2 args: establece el tamaño del canvas, dandole un alto igual a
            args[0] y un alto igual a args[1].
        */
        self.size = function(){

            if(arguments.length == 2){

                self.domElement.width = arguments[0];
                self.domElement.height = arguments[1];

            }
            else if (arguments.length == 0){

                return {
                    width:self.domElement.width, 
                    height:self.domElement.height
                };
            }
        }
    })();
}

/*
  Crear la referencia global a el objeto principal del framework.
*/
window.Atenea = new Atenea();
